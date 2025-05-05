import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Profile from '../components/Profile';

function StudentProfilePage() {
  const [studentData, setStudentData] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load student data from localStorage
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setStudentData(JSON.parse(userData));
    } else {
      // Redirect to login if no user data is found
      navigate('/');
    }
  }, [navigate]);
  
  if (!studentData) {
    return <div>Loading profile...</div>;
  }
  
  return (
    <div>
      <Profile 
        name={studentData.name} 
        email={studentData.email}
        role="Student"
        major={studentData.major}
        gpa={studentData.gpa}
        navigateTo="/student/edit-profile"
        showEditButton={true}
      />
      
      <Container>
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm">
              <Card.Header as="h5">Personal Information</Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={4} className="fw-bold">Full Name:</Col>
                  <Col md={8}>{studentData.name}</Col>
                </Row>
                <Row className="mb-3">
                  <Col md={4} className="fw-bold">Email:</Col>
                  <Col md={8}>{studentData.email}</Col>
                </Row>
                <Row className="mb-3">
                  <Col md={4} className="fw-bold">Student ID:</Col>
                  <Col md={8}>{studentData.id || 'Not specified'}</Col>
                </Row>
                <Row className="mb-3">
                  <Col md={4} className="fw-bold">Major:</Col>
                  <Col md={8}>{studentData.major || 'Not specified'}</Col>
                </Row>
                <Row className="mb-3">
                  <Col md={4} className="fw-bold">GPA:</Col>
                  <Col md={8}>{studentData.gpa || 'Not specified'}</Col>
                </Row>
                <Row className="mb-3">
                  <Col md={4} className="fw-bold">Semester:</Col>
                  <Col md={8}>{studentData.semester || 'Not specified'}</Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm">
              <Card.Header as="h5">Actions</Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <Button 
                    variant="primary" 
                    onClick={() => navigate('/student/home')}
                  >
                    View My Applications
                  </Button>
                  <Button 
                    variant="outline-primary" 
                    onClick={() => navigate('/student/edit-profile')}
                  >
                    Edit Profile
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default StudentProfilePage; 