
import React, {useState } from "react";
import { Link } from "react-router-dom";

import { Container, Card, Form, Button, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { useNavigate } from 'react-router-dom';
import '../css/login.css';


const dummyUsers = {
  student: { email: "muhamed@student.guc.edu.eg", password: "123456" },
  company: { email: "company@company.com", password: "123456" },
  admin: { email: "admin@scad.edu", password: "123456" },
  faculty: { email: "faculty@uni.edu", password: "123456" },
};


export default function LoginPage() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = () => {
    const user = dummyUsers[role];
    if (email === user.email && password === user.password) {
      setMessage(`Welcome, ${role}!`);
        // ✅ Redirect based on role
        if (role === 'student') navigate('/student/home');
      else if (role === 'company') navigate('/company/home');
      else if (role === 'admin') navigate('/admin/home');
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
        <Nav.Item><Nav.Link  className="flex-fill text-center" eventKey="faculty">Faculty Academic</Nav.Link></Nav.Item>
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

};