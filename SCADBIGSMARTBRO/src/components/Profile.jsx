import React from 'react';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import LogoutButton from './LogoutButton';

function Profile({ name, email, role, major, gpa, navigateTo, showEditButton = false }) {
  const navigate = useNavigate();
  
  return (
    <div className="bg-primary text-white py-4 mb-5">
      <Container>
        <Row className="align-items-center">
          <Col md={8}>
            <div className="d-flex align-items-center">
              <div 
                className="rounded-circle bg-white text-primary d-flex justify-content-center align-items-center me-3"
                style={{ width: '60px', height: '60px', fontSize: '1.5rem', fontWeight: 'bold' }}
              >
                {name ? name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="mb-0">{name || 'User'}</h2>
                {email && <p className="mb-0">{email}</p>}
                {role && <p className="mb-0">{role}</p>}
                {major && <p className="mb-0">Major: {major}</p>}
                {gpa && <p className="mb-0">GPA: {gpa}</p>}
              </div>
            </div>
          </Col>
          <Col md={4} className="text-md-end mt-3 mt-md-0">
            <div className="d-flex justify-content-md-end">
              {showEditButton && (
                <Button 
                  variant="light" 
                  className="me-2"
                  onClick={() => navigate(navigateTo)}
                >
                  Edit Profile
                </Button>
              )}
              <LogoutButton />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Profile; 