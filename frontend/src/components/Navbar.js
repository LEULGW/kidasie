// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Navbar.css';

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:5000/logout', {}, {
                withCredentials: true
            });
            sessionStorage.removeItem('user_id');
            setIsLoggedIn(false);
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <nav className="navbar">
            <h1 className="navbar-title">Kidasie</h1>
            <ul className="navbar-links">
                <li><Link to="/" className="navbar-link">Home</Link></li>
                {isLoggedIn ? (
                    <>
                        <li><Link to="/profile" className="navbar-link">Profile</Link></li>
                        <li><Link to="/songlist" className="navbar-link">Songs</Link></li>
                        <li><Link to="/students" className="navbar-link">Students</Link></li>
                        <li>
                            <button className="navbar-button" onClick={handleLogout}>Logout</button>
                        </li>
                    </>
                ) : (
                    <li><Link to="/login" className="navbar-link">Login</Link></li>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
