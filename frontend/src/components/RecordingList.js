// src/components/RecordingList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './RecordingList.css';

const RecordingList = () => {
    const { studentId } = useParams();
    const [recordings, setRecordings] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecordings = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/recordings/${studentId}`,
                    { withCredentials: true }
                );
                console.log('Recordings data:', response.data);
                setRecordings(response.data);
            } catch (error) {
                console.error("Failed to fetch recordings", error);
                setError(error.message);
            }
        };

        fetchRecordings();
    }, [studentId]);

    if (error) {
        return <div>Error loading recordings: {error}</div>;
    }

    return (
        <div className="recording-list-page">
            <div className="recording-list-container">
                <h2>Recordings</h2>

                {recordings.length > 0 ? (
                    <ul>
                        {recordings.map(rec => (
                            <li key={rec.id}>
                                <p>{rec.song_title}</p>
                                <audio
                                    controls
                                    src={rec.audio_url}
                                    onError={(e) => console.error('Audio loading error:', e)}
                                >
                                    <source src={rec.audio_url} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                </audio>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No recordings found for this student</p>
                )}

                <button 
                    onClick={() => navigate('/students')}
                >
                    Back to Student List
                </button>
            </div>
        </div>
    );
};

export default RecordingList;
