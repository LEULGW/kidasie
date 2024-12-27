// src/components/SignUp.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './SignUp.css';

const SignUp = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [teacherId, setTeacherId] = useState('');
    const [teachers, setTeachers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (role === 'student') {
            axios.get(`${process.env.REACT_APP_API_URL}/teachers`, { withCredentials: true })
                .then(response => {
                    setTeachers(response.data);
                })
                .catch(error => {
                    console.error("Failed to fetch teachers", error);
                });
        }
    }, [role]);

    const handleSignUp = async (e) => {
        e.preventDefault();
    
        try {
            const signupData = {
                first_name: firstName,
                last_name: lastName,
                email,
                password,
                role,
                teacher_id: role === 'student' ? teacherId : null
            };

            const response = await axios.post(`${process.env.REACT_APP_API_URL}/signup`, signupData, {
                withCredentials: true
            });            
    
            if (response.data.message === 'User created successfully!') {
                alert('Sign up successful! You can now log in.');
                navigate('/login');
            }
        } catch (error) {
            alert('Error during sign up: ' + (error.response?.data.message || error.message));
        }
    }

    return (
        <div className="signup-container">
            <h1>Sign Up</h1>
            <form onSubmit={handleSignUp}>
                <label>First Name:</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                
                <label>Last Name:</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />

                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                
                <label>Password:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                
                <label>Role:</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                </select>

                {role === 'student' && (
                    <div>
                        <label>Select Teacher/Parent: </label>
                        <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} required>
                            <option value="">Select a Teacher/Parent</option>
                            {teachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.name} ({teacher.role})
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                
                <button type="submit">Sign Up</button>
            </form>

            <div className="login-link">
                <p>Already have an account? <Link to="/login">Log in here</Link></p>
            </div>
        </div>
    );
}

export default SignUp;
