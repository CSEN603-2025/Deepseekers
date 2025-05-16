// /components/NavigationBar.jsx
import React from 'react';
import { Navbar, Nav, Container, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../css/navigationBar.css';
import LogoutButton from './LogoutButton';
import NotificationButton from './NotificationButton';
import ProfileViewsButton from './ProfileViewsButton';
import SCADLogo from '../assets/SCAD_Logo2.png';

const NavigationBar = () => {
  const navigate = useNavigate();
  return (
    <Navbar expand="lg" className="custom-navbar" variant="dark">      <Container fluid className="px-4">
        <div className="d-flex align-items-center">
          <Navbar.Brand className="navbar-brand-container">
            <Image src={SCADLogo} alt="SCAD Logo" className="navbar-logo" />
          </Navbar.Brand>
          <span className="faculty-text">GUC Internship System</span>
        </div>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto align-items-center">
            <Nav.Link onClick={() => navigate('/student/home')}>Home</Nav.Link>
            <Nav.Link onClick={() => navigate('/student/profile')}>Profile</Nav.Link>
            <Nav.Link onClick={() => navigate('/student/internships')}>Internships</Nav.Link>
            <Nav.Link onClick={() => navigate('/student/reports')}>Reports</Nav.Link>
          </Nav>
          <Nav className="align-items-center ms-auto nav-buttons-group">
            <div className="nav-profile-views-wrapper">
              <ProfileViewsButton />
            </div>
            <div className="nav-notification-wrapper me-3">
              <NotificationButton userRole="student" />
            </div>
            <div className="nav-logout-wrapper">
              <LogoutButton />
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;