import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios, { API_URL } from '../api';

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
        axios.get(`${API_URL}/teachers`)
            .then(res => setTeachers(res.data))
            .catch(error => console.error('Failed to fetch teachers', error));
    }, []);

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/signup`, {
                first_name: firstName,
                last_name: lastName,
                email,
                password,
                role,
                teacher_id: role === 'student' ? teacherId : null
            });
            alert('Sign up successful! You can now log in.');
            navigate('/login');
        } catch (error) {
            alert('Error during sign up: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div style={{ padding: 20, maxWidth: 400 }}>
            <h1>Sign Up</h1>
            <form onSubmit={handleSignUp}>
                <p><label>First Name:<br />
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required /></label></p>
                <p><label>Last Name:<br />
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} required /></label></p>
                <p><label>Email:<br />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label></p>
                <p><label>Password:<br />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label></p>
                <p><label>Role:<br />
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="parent">Parent</option>
                    </select></label></p>
                {role === 'student' && (
                    <p><label>Your Teacher/Parent:<br />
                        <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} required>
                            <option value="">Select one</option>
                            {teachers.map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.role})</option>
                            ))}
                        </select></label></p>
                )}
                <button type="submit">Sign Up</button>
            </form>
            <p>Already have an account? <Link to="/login">Log in</Link></p>
        </div>
    );
};

export default SignUp;