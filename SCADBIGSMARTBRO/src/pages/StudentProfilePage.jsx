import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import Profile from '../components/Profile';
import InternshipsAppliedFor from '../components/InternshipsAppliedFor';
import LogoutButton from '../components/LogoutButton';

import { useNavigate } from 'react-router-dom';
import '../css/StudentProfilePage.css';

function StudentProfilePage() {
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Retrieve user data from localStorage
        const userData = localStorage.getItem('currentUser');
        
        if (userData) {
            setCurrentUser(JSON.parse(userData));
        } else {
            // Redirect to login if no user data is found
            navigate('/');
        }
    }, [navigate]);

    if (!currentUser) {
        return <div>Loading profile...</div>;
    }

    return (
        <div className="student-profile-page">   
            <Container className="profile-container py-4">
                <div className="logout-container" style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}>
                    <LogoutButton />
                </div>
                <Profile name={currentUser.name} navigateTo="/student/edit-profile" />
                
                <div className="applied-internships-container mt-4">
                    <InternshipsAppliedFor />
                </div>
            </Container>
        </div>
    );
}

export default StudentProfilePage;