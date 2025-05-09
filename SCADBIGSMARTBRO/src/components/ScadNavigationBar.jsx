import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../css/navigationBar.css';
import LogoutButton from './LogoutButton';

const ScadNavigationBar = () => {
  const navigate = useNavigate();

  return (
    <Navbar expand="lg" className="custom-navbar" variant="dark">
      <Container>
        <Navbar.Brand className="brand-text">SCAD</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="ms-auto">
            <Nav.Link onClick={() => navigate('/scad/home')}>Home</Nav.Link>
            <Nav.Link onClick={() => navigate('/scad/company-applications')}>Company Applications</Nav.Link>
          </Nav>
          <div className="ms-3">
            <LogoutButton />
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default ScadNavigationBar;