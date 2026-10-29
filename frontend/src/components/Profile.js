import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { API_URL } from '../api';

const Profile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '' });

    const load = async () => {
        try {
            const res = await axios.get(`${API_URL}/profile`);
            setProfile(res.data);
            setForm({
                first_name: res.data.first_name,
                last_name: res.data.last_name,
                email: res.data.email,
                password: ''
            });
        } catch (error) {
            if (error.response?.status === 401) navigate('/login');
            else alert('Failed to load profile.');
        }
    };

    useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const save = async () => {
        try {
            await axios.put(`${API_URL}/profile`, form);
            setEditMode(false);
            load();
        } catch (error) {
            alert('Failed to update profile.');
        }
    };

    if (!profile) return <p style={{ padding: 20 }}>Loading...</p>;

    return (
        <div style={{ padding: 20, maxWidth: 400 }}>
            <h1>Profile</h1>
            {editMode ? (
                <div>
                    <p>Leave the password blank to keep it unchanged.</p>
                    <p><input name="first_name" value={form.first_name} onChange={handleChange} /></p>
                    <p><input name="last_name" value={form.last_name} onChange={handleChange} /></p>
                    <p><input name="email" value={form.email} onChange={handleChange} /></p>
                    <p><input name="password" type="password" placeholder="New password" value={form.password} onChange={handleChange} /></p>
                    <button onClick={save}>Save</button>{' '}
                    <button onClick={() => { setEditMode(false); load(); }}>Cancel</button>
                </div>
            ) : (
                <div>
                    <p><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Role:</strong> {profile.role}</p>
                    <button onClick={() => setEditMode(true)}>Edit Profile</button>
                </div>
            )}
        </div>
    );
};

export default Profile;