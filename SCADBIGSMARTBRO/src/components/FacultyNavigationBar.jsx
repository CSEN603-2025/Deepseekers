import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import 'bootstrap/dist/css/bootstrap.min.css';

function FacultyNavigationBar() {
  return (
    <Navbar bg="primary" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/faculty/dashboard">Faculty Portal</Navbar.Brand>
        <Navbar.Toggle aria-controls="faculty-navbar-nav" />
        <Navbar.Collapse id="faculty-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/faculty/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/faculty/applications">Application Review</Nav.Link>
            <Nav.Link as={Link} to="/faculty/students">Students</Nav.Link>
          </Nav>
          <Nav>
            <LogoutButton className="ms-lg-2" />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default FacultyNavigationBar; 