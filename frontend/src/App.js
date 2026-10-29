import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios, { API_URL } from './api';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Profile from './components/Profile';
import SignUp from './components/SignUp';
import SongList from './components/SongList';
import SongDetail from './components/SongDetail';
import StudentList from './components/StudentList';
import RecordingList from './components/RecordingList';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState('');
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        axios.get(`${API_URL}/check-session`)
            .then(res => {
                setIsLoggedIn(true);
                setRole(res.data.role);
            })
            .catch(() => {})
            .finally(() => setChecked(true));
    }, []);

    if (!checked) {
        return <p style={{ padding: 20 }}>Loading... (the server may take up to a minute to wake up)</p>;
    }

    return (
        <Router>
            <Navbar isLoggedIn={isLoggedIn} role={role} setIsLoggedIn={setIsLoggedIn} setRole={setRole} />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setRole={setRole} />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/songlist" element={<SongList />} />
                <Route path="/songs/:songId" element={<SongDetail />} />
                <Route path="/students" element={<StudentList />} />
                <Route path="/recordings/:studentId" element={<RecordingList />} />
            </Routes>
        </Router>
    );
}

export default App;