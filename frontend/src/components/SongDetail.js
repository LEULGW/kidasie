import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SongDetail.css';

const SongDetail = () => {
    const [song, setSong] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingComplete, setRecordingComplete] = useState(false);
    const [audioURL, setAudioURL] = useState('');
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const { songId } = useParams();
    const navigate = useNavigate();

    const fetchSongDetails = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/songs/${songId}`, {
                withCredentials: true
            });
            setSong(response.data);
        } catch (error) {
            console.error("Error fetching song details:", error);
        }
    };

    useEffect(() => {
        fetchSongDetails();
    }, [songId, fetchSongDetails]);

    const startRecording = async () => {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
            console.error("User is not logged in.");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudioURL(audioUrl);

                const formData = new FormData();
                formData.append('audio_file', audioBlob, 'recording.webm');
                formData.append('song_id', songId);
                formData.append('user_id', userId);

                try {
                    const response = await axios.post(`${process.env.REACT_APP_API_URL}/recordings`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        withCredentials: true
                    });
                    console.log('Recording uploaded:', response.data);
                    setRecordingComplete(true);
                    fetchSongDetails();
                } catch (error) {
                    console.error('Error uploading recording:', error);
                }
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const deleteRecording = async (recordingId) => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/recordings/${recordingId}`, { withCredentials: true });
            alert('Recording deleted successfully');
            setSong(prevSong => ({
                ...prevSong,
                recordings: prevSong.recordings.filter(rec => rec.id !== recordingId)
            }));
        } catch (error) {
            console.error('Error deleting recording:', error);
            alert('Failed to delete recording.');
        }
    };

    const renderRecordingsSection = () => {
        if (isRecording) return null;
        if (!song.recordings || song.recordings.length === 0) {
            return <div className="text-gray-600 italic">No recordings yet</div>;
        }
        return (
            <div className="recordings-section">
                <h3>{song.user_role === 'teacher' ? "Student Recordings:" : "Your Recordings:"}</h3>
                {song.recordings.map((recording) => (
                    <div key={recording.id} className="recording-item">
                        {song.user_role === 'teacher' && (
                            <p>Student: {recording.user_name}</p>
                        )}
                        <audio controls className="songdetail-audio">
                            <source src={`${process.env.REACT_APP_API_URL}/${recording.file_path}`} type="audio/mpeg" />
                            Your browser does not support the audio element.
                        </audio>
                        {song.user_role !== 'teacher' && song.user_role !== 'parent' && (
                            <button
                                onClick={() => deleteRecording(recording.id)}
                                className="recording-delete-button"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="songdetail-container">
            {song ? (
                <div>
                    <h1 className="songdetail-header">{song.title} - {song.artist}</h1>
                    
                    <div>
                        <h3>Original Song:</h3>
                        <audio controls className="songdetail-audio">
                            <source src={`${process.env.REACT_APP_API_URL}/${song.file_path}`} type="audio/mpeg" />
                            Your browser does not support the audio element.
                        </audio>
                    </div>

                    <div>
                        {song.user_role !== 'teacher' && song.user_role !== 'parent' && !isRecording ? (
                            <button
                                onClick={startRecording}
                                className="songdetail-recording-button"
                            >
                                Start Recording
                            </button>
                        ) : (
                            song.user_role === 'teacher' || song.user_role === 'parent' ? (
                                <div className="songdetail-recording-status">Teachers and parents cannot record for practice.</div>
                            ) : (
                                <button
                                    onClick={stopRecording}
                                    className="songdetail-recording-button"
                                >
                                    Stop Recording
                                </button>
                            )
                        )}

                        {isRecording && (
                            <div className="songdetail-recording-status">
                                Recording in progress...
                            </div>
                        )}
                    </div>

                    {renderRecordingsSection()}
                </div>
            ) : (
                <p>Loading song details...</p>
            )}
            <button 
                onClick={() => navigate('/songlist')}
                className="back-button"
            >
                Back to Songs List
            </button>
        </div>
    );
};

export default SongDetail;
