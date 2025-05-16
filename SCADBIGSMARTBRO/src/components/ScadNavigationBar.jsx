import React from 'react';
import { Navbar, Nav, Container, Image, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../css/navigationBar.css';
import SCADLogo from '../assets/SCAD_Logo2.png';

const ScadNavigationBar = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  return (
    <Navbar 
      expand="lg" 
      className="custom-navbar faculty-navbar" 
      variant="dark"
    >
      <Container fluid className="px-4">
        <div className="d-flex align-items-center">
          <Navbar.Brand onClick={() => navigate('/scad/home')} className="navbar-brand-container">
            <Image src={SCADLogo} alt="SCAD Logo" className="navbar-logo" />
          </Navbar.Brand>
          <span className="faculty-text">SCAD Portal</span>
        </div>
        
        <Navbar.Toggle aria-controls="scad-navbar-nav" />
        <Navbar.Collapse id="scad-navbar-nav">
          <div className="ms-auto d-flex align-items-center">
            <Nav className="nav-menu d-flex flex-row">
              <Nav.Link 
                onClick={() => navigate('/scad/home')}
                className={window.location.pathname === '/scad/home' ? 'active' : ''}
              >
                Home
              </Nav.Link>
              <Nav.Link 
                onClick={() => navigate('/scad/company-applications')}
                className={window.location.pathname === '/scad/company-applications' ? 'active' : ''}
              >
                Company Applications
              </Nav.Link>
              <Nav.Link 
                onClick={() => navigate('/scad/reports')}
                className={window.location.pathname === '/scad/reports' ? 'active' : ''}
              >
                Reports
              </Nav.Link>
            </Nav>
            
            <Button 
              variant="outline-light" 
              className="logout-btn ms-3" 
              onClick={handleLogout}
            >
              Log out
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default ScadNavigationBar;