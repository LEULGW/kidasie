import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios, { API_URL } from '../api';
import { timeAgo } from '../Dates';

const StudentList = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [windowDays, setWindowDays] = useState(7);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get(`${API_URL}/students`)
            .then(res => {
                setStudents(res.data.students);
                setWindowDays(res.data.window_days);
            })
            .catch(err => {
                if (err.response?.status === 401) navigate('/login');
                else if (err.response?.status === 403) setError("You don't have permission to view students.");
                else setError('Failed to load students.');
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    if (loading) return <p style={{ padding: 20 }}>Loading students...</p>;
    if (error) return <p style={{ padding: 20 }}>{error}</p>;

    // students who have not practiced come first, so they are easy to notice
    const sorted = [...students].sort((a, b) =>
        Number(a.practiced_this_week) - Number(b.practiced_this_week) ||
        a.name.localeCompare(b.name)
    );
    const practicedCount = students.filter(s => s.practiced_this_week).length;

    const meta = (s) => {
        if (s.total_recordings === 0) return 'No recordings yet';
        if (!s.last_practiced) return 'Has recordings (date not tracked)';
        const parts = [`Last practiced ${timeAgo(s.last_practiced)}`];
        if (s.recordings_this_week > 0) {
            parts.push(`${s.recordings_this_week} recording${s.recordings_this_week === 1 ? '' : 's'} in the last ${windowDays} days`);
        }
        return parts.join(' · ');
    };

    return (
        <div style={{ padding: 20 }}>
            <h1>My Students</h1>
            {students.length === 0 && <p>No students found.</p>}
            {students.length > 0 && (
                <p className="practice-summary">
                    <strong>{practicedCount} of {students.length}</strong> practiced in the last {windowDays} days
                </p>
            )}
            <ul>
                {sorted.map(s => (
                    <li key={s.id}>
                        <div className="student-info">
                            <span className="student-name">{s.name}</span>{' '}
                            <span className={`badge ${s.practiced_this_week ? 'badge-yes' : 'badge-no'}`}>
                                {s.practiced_this_week ? 'Practiced' : 'Not practiced'}
                            </span>
                            <br />
                            <small className="student-meta">{meta(s)}</small>
                        </div>
                        <Link className="view-link" to={`/recordings/${s.id}`}>View Recordings</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StudentList;