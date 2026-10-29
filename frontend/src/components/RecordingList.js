import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios, { API_URL, fileUrl } from '../api';

const RecordingList = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [recordings, setRecordings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get(`${API_URL}/recordings/${studentId}`)
            .then(res => setRecordings(res.data))
            .catch(err => {
                if (err.response?.status === 401) navigate('/login');
                else setError('Failed to load recordings.');
            })
            .finally(() => setLoading(false));
    }, [studentId, navigate]);

    if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
    if (error) return <p style={{ padding: 20 }}>{error}</p>;

    return (
        <div style={{ padding: 20, maxWidth: 700 }}>
            <h1>Recordings</h1>
            {recordings.length === 0 && <p>No recordings found for this student.</p>}
            {recordings.map(rec => (
                <div key={rec.id} style={{ marginBottom: 15 }}>
                    <p><strong>{rec.song_title}</strong></p>
                    <audio controls src={fileUrl(rec.file_path)} style={{ width: '100%' }} />
                </div>
            ))}
            <Link to="/students">Back to Students</Link>
        </div>
    );
};

export default RecordingList;