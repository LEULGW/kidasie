import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios, { API_URL } from '../api';

const Navbar = ({ isLoggedIn, role, setIsLoggedIn, setRole }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post(`${API_URL}/logout`);
        } catch (error) {
            console.error('Logout failed', error);
        }
        setIsLoggedIn(false);
        setRole('');
        navigate('/login');
    };

    const canSeeStudents = role === 'teacher' || role === 'parent';

    return (
        <nav style={{ padding: 10 }}>
            <strong>Kidasie</strong>{' | '}
            <Link to="/">Home</Link>{' | '}
            {isLoggedIn ? (
                <>
                    <Link to="/profile">Profile</Link>{' | '}
                    <Link to="/songlist">Songs</Link>{' | '}
                    {canSeeStudents && <><Link to="/students">Students</Link>{' | '}</>}
                    <button onClick={handleLogout}>Logout</button>
                </>
            ) : (
                <>
                    <Link to="/login">Login</Link>{' | '}
                    <Link to="/signup">Sign Up</Link>
                </>
            )}
            <hr />
        </nav>
    );
};

export default Navbar;