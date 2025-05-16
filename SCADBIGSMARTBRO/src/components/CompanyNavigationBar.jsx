import React from 'react';
import { Navbar, Nav, Container, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../css/navigationBar.css';
import SCADLogo from '../assets/SCAD_Logo2.png';
import LogoutButton from './LogoutButton';
import NotificationButton from './NotificationButton';

const CompanyNavigationBar = () => {
  const navigate = useNavigate();

  return (
    <Navbar 
      expand="lg" 
      className="custom-navbar faculty-navbar" 
      variant="dark"
    >
      <Container fluid className="px-4">
        <div className="d-flex align-items-center">
          <Navbar.Brand onClick={() => navigate('/company/dashboard')} className="navbar-brand-container">
            <Image src={SCADLogo} alt="GUC Logo" className="navbar-logo" />
          </Navbar.Brand>
          <span className="faculty-text">Company Portal</span>
        </div>
        
        <Navbar.Toggle aria-controls="company-navbar-nav" />
        <Navbar.Collapse id="company-navbar-nav">
          <Nav className="me-auto align-items-center">
            {/* Navigation links removed as requested */}
          </Nav>
          <div className="d-flex align-items-center">
            <div className="nav-notification-wrapper">
              <NotificationButton userRole="company" />
            </div>
            <div className="nav-logout-wrapper">
              <LogoutButton />
            </div>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CompanyNavigationBar;