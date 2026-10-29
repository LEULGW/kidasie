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
    const [parentId, setParentId] = useState('');
    const [teachers, setTeachers] = useState([]);
    const [parents, setParents] = useState([]);
    const [listError, setListError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([
            axios.get(`${API_URL}/teachers`),
            axios.get(`${API_URL}/parents`)
        ])
            .then(([t, p]) => {
                setTeachers(t.data);
                setParents(p.data);
            })
            .catch(() => setListError(
                'Could not load teachers and parents. Please refresh in a minute (the server may be waking up).'
            ));
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
                teacher_id: role === 'student' ? teacherId : null,
                parent_id: role === 'student' ? parentId : null
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
                    <>
                        {listError && <p>{listError}</p>}
                        <p><label>Your Teacher:<br />
                            <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} required>
                                <option value="">Select your teacher</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select></label></p>
                        <p><label>Your Parent:<br />
                            <select value={parentId} onChange={(e) => setParentId(e.target.value)} required>
                                <option value="">Select your parent</option>
                                {parents.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select></label></p>
                    </>
                )}
                <button type="submit">Sign Up</button>
            </form>
            <p>Already have an account? <Link to="/login">Log in</Link></p>
        </div>
    );
};

export default SignUp;