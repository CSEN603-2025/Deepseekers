import React from 'react';
import Profile from '../components/Profile';
import InternshipsAppliedFor from '../components/InternshipsAppliedFor';
import LogoutButton from '../components/LogoutButton';
import { Container } from 'react-bootstrap';

function StudentProfilePage() {
    return (
        <div>
            <div className="logout-container" style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}>
                <LogoutButton />
            </div>
            <Profile name="Moez Amer" navigateTo="/student/edit-profile" />
            <InternshipsAppliedFor />
        </div>
    );
}

export default StudentProfilePage;