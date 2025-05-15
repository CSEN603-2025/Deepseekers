
import React, {useState } from "react";
import { Link } from "react-router-dom";
import { Container, Card, Form, Button, Nav, Row, Col, InputGroup, Image } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import '../css/login.css';
import { findUserByCredentials } from '../Data/UserData';
import { FaUser, FaLock, FaGraduationCap, FaBuilding, FaUserTie, FaChalkboardTeacher } from 'react-icons/fa';
import SCADLogo from '../assets/SCAD_Logo.png';

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
          pro: user.pro  
        } : {}),
        ...(role === 'faculty' ? {
          department: user.department,
          position: user.position,
          office: user.office,
          research: user.research
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
      <div className="login-card-wrapper">
        {/* Left side - Welcome section */}
        <div className="welcome-section">
          <div className="logo-container">
            <Image src={SCADLogo} alt="SCAD Logo" className="scad-logo" />
          </div>
          <h1>WELCOME</h1>
          <h2>GUC INTERNSHIP PORTAL</h2>
          <p>Connect with top companies, track your applications, and manage your internship journey all in one place.</p>
          
          <div className="welcome-features">
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div className="feature-text">Access to exclusive internship opportunities</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div className="feature-text">Track application status in real-time</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div className="feature-text">Connect with faculty advisors and SCAD members</div>
            </div>
          </div>
        </div>
        
        {/* Right side - Login form */}
        <Card className="login-card">
          <Card.Body>
            <div className="text-center mb-4">
              <h2 className="login-title">Sign In</h2>
              <p className="login-subtitle">Access your internship portal account</p>
            </div>

            <div className="role-selector mb-4">
              <div className={`role-option ${role === 'student' ? 'active' : ''}`} onClick={() => setRole('student')}>
                <FaGraduationCap className="role-icon" />
                <span>Student</span>
              </div>
              <div className={`role-option ${role === 'company' ? 'active' : ''}`} onClick={() => setRole('company')}>
                <FaBuilding className="role-icon" />
                <span>Company</span>
              </div>
              <div className={`role-option ${role === 'scad' ? 'active' : ''}`} onClick={() => setRole('scad')}>
                <FaUserTie className="role-icon" />
                <span>SCAD</span>
              </div>
              <div className={`role-option ${role === 'faculty' ? 'active' : ''}`} onClick={() => setRole('faculty')}>
                <FaChalkboardTeacher className="role-icon" />
                <span>Faculty</span>
              </div>
            </div>

            <Form>
              <Form.Group className="mb-3">
                <InputGroup>
                  <InputGroup.Text className="input-icon-wrapper">
                    <FaUser className="input-icon" />
                  </InputGroup.Text>
                  <Form.Control 
                    type="email" 
                    placeholder="Email Address"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-4">
                <InputGroup>
                  <InputGroup.Text className="input-icon-wrapper">
                    <FaLock className="input-icon" />
                  </InputGroup.Text>
                  <Form.Control 
                    type="password" 
                    placeholder="Password"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                </InputGroup>
              </Form.Group>

              {/* Removed Remember me and Forgot Password */}
              <div className="mb-4"></div>

              <Button className="btn-login w-100" onClick={handleLogin}>Sign In</Button>
              
              {role === 'company' && (
                <div className="text-center mt-4">
                  <p className="register-prompt">Don't have an account? <Link to="/register" className="register-link">Register here</Link></p>
                </div>
              )}
            </Form>

            {message && (
              <div className="message-container mt-3">
                <p className={message.includes("Welcome") ? "success-message" : "error-message"}>{message}</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
