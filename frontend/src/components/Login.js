import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios, { API_URL } from '../api';

const Login = ({ setIsLoggedIn, setRole }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/login`, { email, password });
            setIsLoggedIn(true);
            setRole(res.data.role);
            navigate('/profile');
        } catch (error) {
            alert('Login failed: ' + (error.response?.data?.message || 'Please try again'));
        }
    };

    return (
        <div style={{ padding: 20, maxWidth: 400 }}>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <p>
                    <label>Email:<br />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </label>
                </p>
                <p>
                    <label>Password:<br />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </label>
                </p>
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
        </div>
    );
};

export default Login;