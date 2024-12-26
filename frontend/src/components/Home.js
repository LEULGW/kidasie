// src/components/Home.js
import React from 'react';
import './Home.css';

const Home = () => {
    return (
        <div className="home-page-container">
            <h1 className="home-page-title">Welcome to Kidasie</h1>
            <p className="home-page-description">
                Kidasie is a web platform for managing audio recordings and teaching materials. It allows users to create, store, and share content easily.
            </p>

            <p className="home-page-description">
                Teachers and parents can use Kidasie to monitor progress, review student recordings, and provide feedback. Parents can stay updated on their child’s progress, while teachers can assess and guide students’ work.
            </p>

            <p className="home-page-description">
                Students can record audio, track their progress, and submit work for review.
            </p>

            <div className="home-page-note">
                <strong>Note:</strong> Kidasie is designed primarily for laptops and PCs and is not yet optimized for phones or mobile devices.
            </div>
        </div>
    );
}

export default Home;
