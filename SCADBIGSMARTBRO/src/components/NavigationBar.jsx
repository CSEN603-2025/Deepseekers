// /components/NavigationBar.jsx
import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../css/navigationBar.css';
import LogoutButton from './LogoutButton';
import NotificationButton from './NotificationButton';
import ProfileViewsButton from './ProfileViewsButton';

const NavigationBar = () => {
  const navigate = useNavigate();

  return (
    <Navbar expand="lg" className="custom-navbar" variant="dark">
      <Container fluid className="px-4">
        <Navbar.Brand className="brand-text me-5">GUC Internship System</Navbar.Brand>
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