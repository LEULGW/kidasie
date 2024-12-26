# backend/models.py

from backend.db import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return f'<User {self.first_name} {self.last_name}>'

class Song(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    artist = db.Column(db.String(100), nullable=False)
    file_path = db.Column(db.String(300), nullable=False)

    def __repr__(self):
        return f'<Song {self.title} by {self.artist}>'

class Recording(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    song_id = db.Column(db.Integer, db.ForeignKey('song.id'), nullable=False)
    file_path = db.Column(db.String(300), nullable=False)

    user = db.relationship('User', backref=db.backref('recordings', lazy=True))
    song = db.relationship('Song', backref=db.backref('recordings', lazy=True))

    def __repr__(self):
        return f'<Recording {self.file_path}>'
