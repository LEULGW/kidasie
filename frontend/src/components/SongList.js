import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios, { API_URL } from '../api';

const SongList = () => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState('');

    // new-song recording (teachers only)
    const [title, setTitle] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [saving, setSaving] = useState(false);
    const recorderRef = useRef(null);
    const chunksRef = useRef([]);

    const loadSongs = () =>
        axios.get(`${API_URL}/songs`)
            .then(res => setSongs(res.data))
            .catch(error => console.error('Error fetching songs:', error));

    useEffect(() => {
        loadSongs().finally(() => setLoading(false));
        axios.get(`${API_URL}/check-session`)
            .then(res => setRole(res.data.role))
            .catch(() => {});
    }, []);

    const clearRecording = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
        setAudioBlob(null);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                stream.getTracks().forEach(t => t.stop());
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setPreviewUrl(URL.createObjectURL(blob));
            };

            clearRecording();
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

    const saveSong = async () => {
        if (!title.trim()) {
            alert('Please enter a name for the song.');
            return;
        }
        const formData = new FormData();
        formData.append('audio_file', audioBlob, 'song.webm');
        formData.append('title', title.trim());
        setSaving(true);
        try {
            await axios.post(`${API_URL}/songs`, formData);
            clearRecording();
            setTitle('');
            await loadSongs();
        } catch (error) {
            alert('Failed to save song: ' + (error.response?.data?.message || 'Please try again'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p style={{ padding: 20 }}>Loading songs...</p>;

    return (
        <div style={{ padding: 20 }}>
            <h1>Song List</h1>
            <ul>
                {songs.map(song => (
                    <li key={song.id}>
                        <Link to={`/songs/${song.id}`}>{song.title} - {song.artist}</Link>
                    </li>
                ))}
            </ul>

            {role === 'teacher' && (
                <div>
                    <hr />
                    <h3>Record a New Song</h3>
                    <p>
                        <label>Song name:
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter the name of the song"
                            />
                        </label>
                    </p>
                    <p>
                        {isRecording ? (
                            <>
                                <strong>Recording... </strong>
                                <button onClick={stopRecording}>Stop Recording</button>
                            </>
                        ) : (
                            <button onClick={startRecording} disabled={saving}>
                                {audioBlob ? 'Record Again' : 'Start Recording'}
                            </button>
                        )}
                    </p>
                    {audioBlob && !isRecording && (
                        <>
                            <audio controls src={previewUrl} />
                            <p>
                                <button onClick={saveSong} disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Song'}
                                </button>{' '}
                                <button onClick={clearRecording} disabled={saving}>Discard</button>
                            </p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SongList;