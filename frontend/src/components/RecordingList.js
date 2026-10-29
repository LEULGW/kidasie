import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios, { API_URL, fileUrl } from '../api';
import Feedback from './Feedback';
import { timeAgo, formatDateTime } from './Dates';

const RecordingList = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [recordings, setRecordings] = useState([]);
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = () =>
        axios.get(`${API_URL}/recordings/${studentId}`)
            .then(res => setRecordings(res.data))
            .catch(err => {
                if (err.response?.status === 401) navigate('/login');
                else setError('Failed to load recordings.');
            });

    useEffect(() => {
        load().finally(() => setLoading(false));
        axios.get(`${API_URL}/check-session`)
            .then(res => setRole(res.data.role))
            .catch(() => {});
    }, [studentId, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
    if (error) return <p style={{ padding: 20 }}>{error}</p>;

    const canPost = role === 'teacher' || role === 'parent';

    return (
        <div style={{ padding: 20, maxWidth: 700 }}>
            <h1>Recordings</h1>
            {recordings.length === 0 && <p>No recordings found for this student.</p>}
            {recordings.map(rec => (
                <div key={rec.id} style={{ marginBottom: 15 }}>
                    <p>
                        <strong>{rec.song_title}</strong>
                        {rec.created_at && (
                            <>
                                <br />
                                <small>Recorded {formatDateTime(rec.created_at)} ({timeAgo(rec.created_at)})</small>
                            </>
                        )}
                    </p>
                    <audio controls src={fileUrl(rec.file_path)} style={{ width: '100%' }} />
                    <Feedback recordingId={rec.id} feedback={rec.feedback} canPost={canPost} onPosted={load} />
                </div>
            ))}
            <Link to="/students">Back to Students</Link>
        </div>
    );
};

export default RecordingList;