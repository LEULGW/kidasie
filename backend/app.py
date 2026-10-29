from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from werkzeug.utils import secure_filename
from datetime import timedelta, datetime
import os, json, time

basedir = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(basedir, 'static', 'recordings')
SONGS_FOLDER = os.path.join(basedir, 'static', 'songs')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(SONGS_FOLDER, exist_ok=True)
os.makedirs(os.path.join(basedir, 'instance'), exist_ok=True)

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-only-change-me')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "instance", "kidasie.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_NAME'] = 'kidasie_session'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

db = SQLAlchemy(app)

CORS(app, origins=["https://kidasie-frontend.vercel.app", "http://localhost:3000"], supports_credentials=True)

@app.route('/')
def index():
    return "Welcome to the Kidasie backend app!"


# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(50), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # New field
    students = db.relationship('User', backref=db.backref('teacher', remote_side=[id]),
                             foreign_keys=[teacher_id])

    def __repr__(self):
        return f"<User {self.first_name} {self.last_name}>"

# User registration
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()

    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({"message": "Email already exists"}), 400

    try:
        hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
        new_user = User(
            email=data['email'],
            password=hashed_password,
            first_name=data['first_name'],
            last_name=data['last_name'],
            role=data['role']
        )

        if data['role'] == 'student' and 'teacher_id' in data:
            new_user.teacher_id = data['teacher_id']

        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User created successfully!"}), 201
    except Exception as e:
        print(f"Error creating user: {e}")
        return jsonify({"message": "Error creating user", "error": str(e)}), 400


# User login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    print("Login attempt for email:", data['email']) 
    
    if user and check_password_hash(user.password, data['password']):
        session['user_id'] = user.id
        print("User authenticated, id:", user.id)
        response_data = {
            "message": "Login successful",
            "role": user.role,
            "user_id": user.id
        }
        print("Sending response:", response_data)
        return jsonify(response_data), 200
    return jsonify({"message": "Invalid credentials"}), 401


@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"})


# Get user profile
@app.route('/profile', methods=['GET'])
def profile():
    if 'user_id' not in session:
        return jsonify({"message": "Not logged in"}), 401

    user = User.query.get(session['user_id'])
    if user:
        return jsonify({
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "role": user.role
        })
    return jsonify({"message": "User not found"}), 404


@app.route('/students', methods=['GET'])
def get_students():
    if 'user_id' not in session:
        return jsonify({"message": "Not logged in"}), 401

    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    if user.role not in ['teacher', 'parent']:
        return jsonify({"message": "Access denied"}), 403

    students = User.query.filter_by(teacher_id=user.id).all()
    student_data = []

    for student in students:
        recordings = Recording.query.filter_by(user_id=student.id).all()
        student_data.append({
            "id": student.id,
            "name": f"{student.first_name} {student.last_name}",
            "recordings": [{
                "id": rec.id,
                "song_id": rec.song_id,
                "song_title": rec.song.title,
                "file_path": rec.file_path
            } for rec in recordings]
        })

    return jsonify(student_data)

@app.route('/teachers', methods=['GET'])
def get_teachers():
    teachers = User.query.filter(User.role.in_(['teacher', 'parent'])).all()
    return jsonify([{
        "id": teacher.id,
        "name": f"{teacher.first_name} {teacher.last_name}",
        "role": teacher.role
    } for teacher in teachers])

@app.route('/recordings/<int:student_id>', methods=['GET'])
def get_recordings_by_student(student_id):
    if 'user_id' not in session:
        return jsonify({"message": "Not logged in"}), 401

    student = User.query.get(student_id)
    if not student or student.role != 'student':
        return jsonify({"message": "Student not found"}), 404

    recordings = Recording.query.filter_by(user_id=student_id).all()
    if not recordings:
        return jsonify([]), 200

    return jsonify([{
        "id": rec.id,
        "song_id": rec.song_id,
        "song_title": rec.song.title,
        "file_path": rec.file_path,
        "feedback": feedback_list(rec)
    } for rec in recordings])


@app.route('/profile', methods=['PUT'])
def update_profile():
    if 'user_id' not in session:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json()
    user = User.query.get(session['user_id'])

    if not user:
        return jsonify({"message": "User not found"}), 404

    user.first_name = data.get('first_name', user.first_name)
    user.last_name = data.get('last_name', user.last_name)
    user.email = data.get('email', user.email)
    if data.get('password'):
        user.password = generate_password_hash(data['password'], method='pbkdf2:sha256')

    db.session.commit()
    return jsonify({"message": "Profile updated successfully"})


@app.route('/check-session', methods=['GET'])
def check_session():
    if 'user_id' in session:
        return jsonify({
            'isLoggedIn': True,
            'userId': session['user_id'],
            'role': User.query.get(session['user_id']).role
        })
    return jsonify({
        'isLoggedIn': False
    }), 401



# Song model (mock songs)
class Song(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    artist = db.Column(db.String(100), nullable=False)
    file_path = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return f"<Song {self.title} by {self.artist}>"

# Get song list
@app.route('/songs', methods=['GET'])
def get_songs():
    songs = Song.query.all()
    response = jsonify([{"id": song.id, "title": song.title, "artist": song.artist} 
                       for song in songs])
    return response

# Teachers record a new song
@app.route('/songs', methods=['POST'])
def create_song():
    if 'user_id' not in session:
        return jsonify({"message": "Not logged in"}), 401

    user = User.query.get(session['user_id'])
    if not user or user.role != 'teacher':
        return jsonify({"message": "Only teachers can add songs"}), 403

    title = (request.form.get('title') or '').strip()
    if not title:
        return jsonify({"message": "Song name is required"}), 400
    if 'audio_file' not in request.files:
        return jsonify({"message": "No file part"}), 400

    file = request.files['audio_file']
    if not file.filename.endswith('.webm'):
        return jsonify({"message": "Unsupported file format"}), 415

    filename = secure_filename(f"teacher_{user.id}_{int(time.time())}.webm")
    file.save(os.path.join(SONGS_FOLDER, filename))

    song = Song(
        title=title,
        artist=f"{user.first_name} {user.last_name}",
        file_path=f"/static/songs/{filename}"
    )
    db.session.add(song)
    db.session.commit()
    return jsonify({"message": "Song saved successfully!", "id": song.id}), 201


# Get details for a single song
@app.route('/songs/<int:song_id>', methods=['GET'])
def get_song(song_id):
    if 'user_id' not in session:
        return jsonify({"message": "Not logged in"}), 401
        
    current_user_id = session['user_id']
    current_user = User.query.get(current_user_id)
    song = Song.query.get(song_id)
    
    if song:
        if current_user.role in ('teacher', 'parent'):
            student_ids = [student.id for student in current_user.students]
            recordings = Recording.query.filter(
                Recording.song_id == song_id,
                Recording.user_id.in_(student_ids)
            ).all()
        else:
            recordings = Recording.query.filter_by(
                song_id=song_id,
                user_id=current_user_id
            ).all()
        
        recordings_data = []
        for recording in recordings:
            user = User.query.get(recording.user_id)
            recordings_data.append({
                "id": recording.id,
                "user_id": recording.user_id,
                "user_name": f"{user.first_name} {user.last_name}",
                "file_path": recording.file_path,
                "created_at": recording.created_at if hasattr(recording, 'created_at') else None,
                "feedback": feedback_list(recording)
            })
            
        return jsonify({
            "id": song.id,
            "title": song.title,
            "artist": song.artist,
            "file_path": song.file_path,
            "recordings": recordings_data,
            "user_role": current_user.role
        })
    return jsonify({"message": "Song not found"}), 404

class Recording(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    song_id = db.Column(db.Integer, db.ForeignKey('song.id'), nullable=False)
    file_path = db.Column(db.String(200), nullable=False)
    song = db.relationship('Song', backref='recordings')

    def __repr__(self):
        return f"<Recording {self.id} for song {self.song_id}>"


# Feedback from a teacher/parent on a student's recording
class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    recording_id = db.Column(db.Integer, db.ForeignKey('recording.id'), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    text = db.Column(db.String(1000), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    author = db.relationship('User')
    recording = db.relationship(
        'Recording',
        backref=db.backref('feedback', cascade='all, delete-orphan', order_by='Feedback.id')
    )


def feedback_list(rec):
    return [{
        "id": f.id,
        "text": f.text,
        "author": f"{f.author.first_name} {f.author.last_name}",
        "role": f.author.role,
        "created_at": f.created_at.strftime('%b %d, %Y') if f.created_at else ''
    } for f in rec.feedback]


# Give feedback on a recording (only the student's own teacher/parent)
@app.route('/recordings/<int:recording_id>/feedback', methods=['POST'])
def add_feedback(recording_id):
    if 'user_id' not in session:
        return jsonify({"message": "Not logged in"}), 401

    user = User.query.get(session['user_id'])
    recording = Recording.query.get(recording_id)
    if not user or not recording:
        return jsonify({"message": "Recording not found"}), 404

    student = User.query.get(recording.user_id)
    if user.role not in ('teacher', 'parent') or student.teacher_id != user.id:
        return jsonify({"message": "Only this student's teacher or parent can give feedback"}), 403

    text = ((request.get_json() or {}).get('text') or '').strip()
    if not text:
        return jsonify({"message": "Feedback can't be empty"}), 400

    db.session.add(Feedback(recording_id=recording.id, author_id=user.id, text=text))
    db.session.commit()
    return jsonify({"message": "Feedback saved"}), 201

# Store a recording
@app.route('/recordings', methods=['POST'])
def create_recording():
    if 'user_id' not in session:
        return jsonify({"message": "Not logged in"}), 401
    if 'audio_file' not in request.files:
        return jsonify({"message": "No file part"}), 400

    file = request.files['audio_file']
    if not file.filename.endswith('.webm'):
        return jsonify({"message": "Unsupported file format"}), 415

    user_id = session['user_id']
    song_id = request.form.get('song_id')

    filename = secure_filename(f"user_{user_id}_song_{song_id}.webm")
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

    # same filename gets overwritten, so don't create a duplicate row
    path = f'static/recordings/{filename}'
    if not Recording.query.filter_by(user_id=user_id, song_id=song_id).first():
        db.session.add(Recording(user_id=user_id, song_id=song_id, file_path=path))
        db.session.commit()
    return jsonify({"message": "Recording saved successfully!"}), 201


@app.route('/recordings/<int:recording_id>', methods=['DELETE'])
def delete_recording(recording_id):
    if 'user_id' not in session:
        return jsonify({"message": "Unauthorized"}), 401

    recording = Recording.query.get(recording_id)
    if not recording or recording.user_id != session['user_id']:
        return jsonify({"message": "Recording not found or unauthorized"}), 404

    try:
        os.remove(os.path.join(basedir, recording.file_path))
    except FileNotFoundError:
        pass

    db.session.delete(recording)
    db.session.commit()
    return jsonify({"message": "Recording deleted successfully"})

def init_db():
    with app.app_context():
        db.create_all()
        if User.query.first():
            return
        with open(os.path.join(basedir, 'database_content.json')) as f:
            data = json.load(f)
        for u in data['users']:
            db.session.add(User(**u))
        for s in data['songs']:
            db.session.add(Song(**s))
        db.session.commit()

init_db()   # runs on gunicorn too

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)