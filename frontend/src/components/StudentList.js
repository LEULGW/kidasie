// src/components/StudentList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './StudentList.css';

const StudentList = () => {
    const [students, setStudents] = useState([]);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const userId = localStorage.getItem('user_id');
                if (!userId) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get(`${process.env.REACT_APP_API_URL}/students`, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                setStudents(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch students:", error);
                if (error.response?.status === 401) {
                    navigate('/login');
                } else if (error.response?.status === 403) {
                    setError("You don't have permission to view students.");
                } else {
                    setError("Failed to load students. Please try again later.");
                }
                setLoading(false);
            }
        };

        fetchStudents();
    }, [navigate]);
    
    return (
        <div className="student-list-page">
            <div className="student-list-container">
                <h2>My Students</h2>
                {students.length > 0 ? (
                    students.map(student => (
                        <div key={student.id} className="student-card">
                            <h3>{student.name}</h3>
                            <Link to={`/recordings/${student.id}`}>
                                <button>View Recordings</button>
                            </Link>
                        </div>
                    ))
                ) : (
                    <p>No students found</p>
                )}
            </div>
        </div>
    );
};

export default StudentList;
