// src/components/Profile.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [updatedProfile, setUpdatedProfile] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/profile`, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                setProfile(response.data);
                setUpdatedProfile({
                    first_name: response.data.first_name,
                    last_name: response.data.last_name,
                    email: response.data.email,
                    password: '',
                });
            } catch (error) {
                console.error("Error fetching profile:", error);
                if (error.response?.status === 401) {
                    // Redirect to login if unauthorized
                    window.location.href = '/login';
                } else {
                    alert('Failed to fetch profile. Please try again.');
                }
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdatedProfile({ ...updatedProfile, [name]: value });
    };

    const saveChanges = async () => {
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/profile`, updatedProfile, { withCredentials: true });
            alert('Profile updated successfully!');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/profile`, { withCredentials: true });
            setProfile(response.data);
            setEditMode(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
        }
    };

    const handleCancel = () => {
        setEditMode(false);
        setUpdatedProfile({
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: profile.email,
            password: '',
        });
    };

    return (
        <div className="profile-page">
            <div className="profile-container">
                <h1 className="profile-header">Profile</h1>
                {profile ? (
                    <div>
                        {editMode ? (
                            <div className="profile-edit-container">
                                <p>Edit only the fields you want to modify, and leave the rest unchanged.</p>
                                <input name="first_name" value={updatedProfile.first_name} onChange={handleChange} />
                                <input name="last_name" value={updatedProfile.last_name} onChange={handleChange} />
                                <input name="email" value={updatedProfile.email} onChange={handleChange} />
                                <input name="password" type="password" value={updatedProfile.password} onChange={handleChange} placeholder="New Password" />
                                <div className="button-group">
                                    <button className="save-btn" onClick={saveChanges}>Save Changes</button>
                                    <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div className="profile-info-box">
                                <p><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
                                <p><strong>Email:</strong> {profile.email}</p>
                                <p><strong>Role:</strong> {profile.role}</p>
                                <button className="edit-btn" onClick={() => setEditMode(true)}>Edit Profile</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </div>
    );
};

export default Profile;