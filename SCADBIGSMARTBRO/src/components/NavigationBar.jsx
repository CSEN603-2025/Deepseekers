// /components/NavigationBar.jsx
import React from 'react';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../css/navigationBar.css';

const NavigationBar = () => {
  const navigate = useNavigate();

  return (
    <Navbar expand="lg" className="custom-navbar" variant="dark">
      <Container>
        <Navbar.Brand className="brand-text">GUC Internship System</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="ms-auto">
            <Nav.Link onClick={() => navigate('/student/home')}>Home</Nav.Link>
            <Nav.Link onClick={() => navigate('/student/profile')}>Profile</Nav.Link>
            <Nav.Link onClick={() => navigate('/student/internships')}>Internships</Nav.Link>
            <Nav.Link onClick={() => navigate('/student/assessments')}>
              Assessments
              <Badge
                className="ms-1 pro-badge"
              >
                PRO
              </Badge>
            </Nav.Link>
            {/* Add more links as needed */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;