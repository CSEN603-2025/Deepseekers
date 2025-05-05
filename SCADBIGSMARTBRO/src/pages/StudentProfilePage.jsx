import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Profile from '../components/Profile';
import InternshipsAppliedFor from '../components/InternshipsAppliedFor';
import LogoutButton from '../components/LogoutButton';
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
            <div className="logout-container" style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}>
                <LogoutButton />
            </div>
            
            {/* Use the enhanced Profile component with profileType and userData props */}
            <Profile 
                name={currentUser.name} 
                navigateTo="/student/edit-profile" 
                showEditButton={true}
                profileType="student"
                userData={currentUser}
            />

            <Container className="applied-internships-container">
                <Row>
                    <Col>
                        <InternshipsAppliedFor />
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default StudentProfilePage;