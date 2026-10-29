import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios, { API_URL, fileUrl } from '../api';

const SongDetail = () => {
    const { songId } = useParams();
    const navigate = useNavigate();
    const [song, setSong] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [version, setVersion] = useState(Date.now()); // avoids cached old recordings
    const recorderRef = useRef(null);
    const chunksRef = useRef([]);

    const fetchSong = async () => {
        try {
            const res = await axios.get(`${API_URL}/songs/${songId}`);
            setSong(res.data);
            setVersion(Date.now());
        } catch (error) {
            if (error.response?.status === 401) navigate('/login');
            else alert('Error loading song.');
        }
    };

    useEffect(() => { fetchSong(); }, [songId]); // eslint-disable-line react-hooks/exhaustive-deps

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = async () => {
                stream.getTracks().forEach(t => t.stop());
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const formData = new FormData();
                formData.append('audio_file', blob, 'recording.webm');
                formData.append('song_id', songId);
                try {
                    await axios.post(`${API_URL}/recordings`, formData);
                    fetchSong();
                } catch (error) {
                    alert('Upload failed. Please try again.');
                }
            };

            recorder.start();
            recorderRef.current = recorder;
            setIsRecording(true);
        } catch (error) {
            alert('Could not access the microphone.');
        }
    };

    const stopRecording = () => {
        recorderRef.current.stop();
        setIsRecording(false);
    };

    const deleteRecording = async (id) => {
        if (!window.confirm('Delete this recording?')) return;
        try {
            await axios.delete(`${API_URL}/recordings/${id}`);
            fetchSong();
        } catch (error) {
            alert('Failed to delete recording.');
        }
    };

    if (!song) return <p style={{ padding: 20 }}>Loading song...</p>;

    const isStudent = song.user_role === 'student';

    return (
        <div style={{ padding: 20, maxWidth: 700 }}>
            <h1>{song.title} - {song.artist}</h1>

            <h3>Original Song</h3>
            <audio controls src={fileUrl(song.file_path)} style={{ width: '100%' }} />

            {isStudent ? (
                <p>
                    {isRecording ? (
                        <>
                            <strong>Recording... </strong>
                            <button onClick={stopRecording}>Stop Recording</button>
                        </>
                    ) : (
                        <button onClick={startRecording}>Start Recording</button>
                    )}
                </p>
            ) : (
                <p><em>Only students can record.</em></p>
            )}

            <h3>{isStudent ? 'Your Recordings' : 'Student Recordings'}</h3>
            {song.recordings.length === 0 && <p>No recordings yet.</p>}
            {song.recordings.map(rec => (
                <div key={rec.id} style={{ marginBottom: 15 }}>
                    {!isStudent && <p>Student: {rec.user_name}</p>}
                    <audio controls src={`${fileUrl(rec.file_path)}?v=${version}`} style={{ width: '100%' }} />
                    {isStudent && <button onClick={() => deleteRecording(rec.id)}>Delete</button>}
                </div>
            ))}

            <button onClick={() => navigate('/songlist')}>Back to Songs</button>
        </div>
    );
};

export default SongDetail;