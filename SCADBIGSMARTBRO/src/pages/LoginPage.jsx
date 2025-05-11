import React, {useState } from "react";
import { Link } from "react-router-dom";
import { Container, Card, Form, Button, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import '../css/login.css';
import { findUserByCredentials } from '../Data/UserData';

export default function LoginPage() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const user = findUserByCredentials(email, password, role);
    
    if (user) {
      if (role === 'student') {
        // Use a structured storage approach for student profiles
        const allStudentProfiles = JSON.parse(localStorage.getItem('allStudentProfiles')) || {};
        
        // Check if there's existing profile data for this student
        if (allStudentProfiles[user.id]) {
          // Update existing profile while preserving custom fields
          allStudentProfiles[user.id] = {
            ...allStudentProfiles[user.id],
            // Always use the latest basic info from user
            name: user.name,
            email: user.email,
            gucId: user.gucId,
            faculty: user.faculty,
            major: user.major
          };
        } else {
          // Create new profile entry for this student
          allStudentProfiles[user.id] = {
            id: user.id,
            name: user.name,
            email: user.email,
            gucId: user.gucId,
            faculty: user.faculty,
            major: user.major,
            jobInterests: '',
            internships: '',
            activities: '',
            semester: ''
          };
        }
        
        // Save the updated profiles collection
        localStorage.setItem('allStudentProfiles', JSON.stringify(allStudentProfiles));
        
        // Set the current profile for backward compatibility
        // This can be removed once all components are updated to use allStudentProfiles
        localStorage.setItem('studentProfile', JSON.stringify(allStudentProfiles[user.id]));
      }
      
      // Store user data in localStorage for use across components
      localStorage.setItem('currentUser', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: role,
        // Store other relevant user data but exclude password
        ...(role === 'student' ? { 
          gucId: user.gucId,
          faculty: user.faculty,
          major: user.major,
          bio: user.bio,
          skills: user.skills,
          location: user.location,
          pro: user.pro  // Add this line to include the pro property
        } : {})
      }));
      
      setMessage(`Welcome, ${user.name}!`);
      
      // Redirect based on role
      if (role === 'student') navigate('/student/home');
      else if (role === 'company') navigate('/company/dashboard');
      else if (role === 'scad') navigate('/scad/home');
      else if (role === 'faculty') navigate('/faculty/home');
    } else {
      setMessage("Invalid credentials");
    }
  };
  
  return (
    <div className="login-container">
      <Card className="login-card">
        <Card.Title className="login-title mb-3">Internship Portal Login</Card.Title>

        <Nav variant="tabs" activeKey={role} onSelect={(k) => setRole(k)} className="custom-tabs mb-4 d-flex justify-content-center">
          <Nav.Item><Nav.Link eventKey="student">Student</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="company">Company</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="scad">SCAD Member</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link className="flex-fill text-center" eventKey="faculty">Faculty Academic</Nav.Link></Nav.Item>
        </Nav>

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" placeholder="Enter email"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Password"
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </Form.Group>

          <Button className="btn-login w-100" onClick={handleLogin}>Login</Button>
        </Form>

        {role === 'company' && (
          <div className="text-center mt-3">
            <Link to="/register" className="register-link">
              New company? Register here
            </Link>
          </div>
        )}

        {message && (
          <div className="mt-3 text-center">
            <p>{message}</p>
          </div>
        )}

      </Card>
    </div>
  );
}