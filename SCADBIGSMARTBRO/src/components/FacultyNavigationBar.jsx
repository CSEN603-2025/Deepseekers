
import React from 'react';
import { Navbar, Nav, Container, Image, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../css/navigationBar.css';
import SCADLogo from '../assets/SCAD_Logo2.png';

const FacultyNavigationBar = () => {
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
          <Navbar.Brand onClick={() => navigate('/faculty/home')} className="navbar-brand-container">
            <Image src={SCADLogo} alt="SCAD Logo" className="navbar-logo" />
          </Navbar.Brand>
          <span className="faculty-text">Faculty Portal</span>
        </div>
        
        <Navbar.Toggle aria-controls="faculty-navbar-nav" />
        <Navbar.Collapse id="faculty-navbar-nav">
          <div className="ms-auto d-flex align-items-center">
            <Nav className="nav-menu d-flex flex-row">
              <Nav.Link 
                onClick={() => navigate('/faculty/home')}
                className={window.location.pathname === '/faculty/home' ? 'active' : ''}
              >
                Home
              </Nav.Link>
              <Nav.Link 
                onClick={() => navigate('/faculty/reports')}
                className={window.location.pathname === '/faculty/reports' ? 'active' : ''}
              >
                Student Reports
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
}

export default FacultyNavigationBar;
