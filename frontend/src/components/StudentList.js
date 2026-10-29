import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios, { API_URL } from '../api';

const StudentList = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get(`${API_URL}/students`)
            .then(res => setStudents(res.data))
            .catch(err => {
                if (err.response?.status === 401) navigate('/login');
                else if (err.response?.status === 403) setError("You don't have permission to view students.");
                else setError('Failed to load students.');
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    if (loading) return <p style={{ padding: 20 }}>Loading students...</p>;
    if (error) return <p style={{ padding: 20 }}>{error}</p>;

    return (
        <div style={{ padding: 20 }}>
            <h1>My Students</h1>
            {students.length === 0 && <p>No students found.</p>}
            <ul>
                {students.map(s => (
                    <li key={s.id}>
                        {s.name} - <Link to={`/recordings/${s.id}`}>View Recordings</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StudentList;