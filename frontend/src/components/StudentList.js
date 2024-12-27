// src/components/StudentList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './StudentList.css';

const StudentList = () => {
    const [students, setStudents] = useState([]);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/students`, { withCredentials: true })
            .then(response => {
                setStudents(response.data);
            })
            .catch(error => {
                console.error("Failed to fetch students", error);
            });
    }, []);

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
