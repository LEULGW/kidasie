import React, { useState } from 'react';
import axios, { API_URL } from '../api';

const Feedback = ({ recordingId, feedback = [], canPost, onPosted }) => {
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);

    const send = async () => {
        if (!text.trim()) return;
        setSending(true);
        try {
            await axios.post(`${API_URL}/recordings/${recordingId}/feedback`, { text });
            setText('');
            onPosted();
        } catch (error) {
            alert('Failed to send feedback: ' + (error.response?.data?.message || 'Please try again'));
        } finally {
            setSending(false);
        }
    };

    return (
        <div style={{ marginTop: 8 }}>
            <strong>Feedback</strong>
            {feedback.length === 0 && <p><em>No feedback yet.</em></p>}
            {feedback.map(f => (
                <p key={f.id}>
                    <strong>{f.author} ({f.role}):</strong> {f.text} <small>{f.created_at}</small>
                </p>
            ))}
            {canPost && (
                <>
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Write feedback for this recording"
                        maxLength={1000}
                    />
                    <p>
                        <button onClick={send} disabled={sending}>
                            {sending ? 'Sending...' : 'Send Feedback'}
                        </button>
                    </p>
                </>
            )}
        </div>
    );
};

export default Feedback;