import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Profile from './components/Profile';
import SignUp from './components/SignUp';
import SongList from './components/SongList';
import SongDetail from './components/SongDetail';
import StudentList from './components/StudentList';
import RecordingList from './components/RecordingList';
import axios from 'axios';

axios.defaults.baseURL = 'https://kidasie-backend.onrender.com';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    useEffect(() => {
        localStorage.removeItem('user_id');
        setIsLoggedIn(false);

        const checkLoginStatus = async () => {
            try {
                const response = await axios.get('/check-session');
                if (response.data.isLoggedIn) {
                    localStorage.setItem('user_id', response.data.userId);
                    setIsLoggedIn(true);
                }
            } catch (error) {
                console.log('No active session');
                localStorage.removeItem('user_id');
                setIsLoggedIn(false);
            }
        };

        checkLoginStatus();
    }, []);

    return (
        <Router>
            <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
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
