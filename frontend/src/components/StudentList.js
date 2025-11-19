// src/components/StudentList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './StudentList.css';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // NEW: teachers + selected teacher
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState("");

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

    // NEW: fetch teachers
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/teachers`, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                });
                setTeachers(response.data);
            } catch (err) {
                console.error("Failed to fetch teachers:", err);
            }
        };

        fetchTeachers();
    }, []);

    if (loading) {
        return (
            <div className="student-list-page">
                <div className="student-list-container">
                    <h2>My Students</h2>
                    <p>Loading students...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="student-list-page">
                <div className="student-list-container">
                    <h2>My Students</h2>
                    <p className="error-message">{error}</p>
                </div>
            </div>
        );
    }

    //  filter students by teacher
    const filteredStudents = selectedTeacher
        ? students.filter(s => s.teacher_id === parseInt(selectedTeacher))
        : students;

    return (
        <div className="student-list-page">
            <div className="student-list-container">
                <h2>My Students</h2>

                {/* NEW: Teacher dropdown */}
                {teachers.length > 0 && (
                    <div className="teacher-filter">
                        <label htmlFor="teacherSelect">Filter by Teacher:</label>
                        <select
                            id="teacherSelect"
                            value={selectedTeacher}
                            onChange={(e) => setSelectedTeacher(e.target.value)}
                        >
                            <option value="">All Teachers</option>
                            {teachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* UPDATED: using filteredStudents */}
                {filteredStudents.length > 0 ? (
                    filteredStudents.map(student => (
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

