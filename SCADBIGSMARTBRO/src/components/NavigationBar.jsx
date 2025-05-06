// /components/NavigationBar.jsx
import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
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
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;