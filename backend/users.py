# backend/users.py

from flask import Blueprint, request, jsonify
from backend.models import User
from backend.db import db

users_bp = Blueprint('users', __name__)

# Route to create a new user (signup)
@users_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    new_user = User(first_name=first_name, last_name=last_name, email=email, password=password, role=role)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully"}), 201

# Route to log in (authenticate)
@users_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user and user.password == password:
        return jsonify({"message": "Login successful", "user": {"id": user.id, "name": f"{user.first_name} {user.last_name}"}})
    return jsonify({"message": "Invalid credentials"}), 401

# Route to view profile
@users_bp.route('/profile', methods=['GET'])
def profile():
    user = User.query.first()
    return jsonify({
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "role": user.role
    })
