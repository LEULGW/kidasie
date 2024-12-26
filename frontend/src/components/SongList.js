// src/components/SongList.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './SongList.css';

const SongList = () => {
    const [songs, setSongs] = useState([]);

    useEffect(() => {
        const fetchSongs = async () => {
            try {
            const response = await axios.get('http://localhost:5000/songs', {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                }
            });
                console.log(response.data);
                setSongs(response.data);
            } catch (error) {
                console.error("Error fetching songs:", error);
            }
        };        
        fetchSongs();
    }, []);    

    return (
        <div className="songlist-container">
            <h1 className="songlist-header">Song List</h1>
            <ul className="songlist">
                {songs.map(song => (
                    <li key={song.id} className="songlist-item">
                        <Link to={`/songs/${song.id}`}>
                            <div className="song-details">
                                <span>{song.title} - {song.artist}</span>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default SongList;
