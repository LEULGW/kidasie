import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios, { API_URL } from '../api';

const SongList = () => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API_URL}/songs`)
            .then(res => setSongs(res.data))
            .catch(error => console.error('Error fetching songs:', error))
            .finally(() => setLoading(false));
    }, []);

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
        </div>
    );
};

export default SongList;