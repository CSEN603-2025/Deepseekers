import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Profile from '../components/Profile';

function StudentEditProfilePage() {
  const [studentData, setStudentData] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [major, setMajor] = useState('');
  const [gpa, setGpa] = useState('');
  const [semester, setSemester] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load student data from localStorage
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      setStudentData(parsedUserData);
      
      // Initialize form fields with current values
      setName(parsedUserData.name || '');
      setEmail(parsedUserData.email || '');
      setMajor(parsedUserData.major || '');
      setGpa(parsedUserData.gpa || '');
      setSemester(parsedUserData.semester || '');
    } else {
      // Redirect to login if no user data is found
      navigate('/');
    }
  }, [navigate]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!major.trim()) {
      setError('Major is required');
      return;
    }
    
    // GPA validation - must be a number between 0 and 4.0
    const gpaValue = parseFloat(gpa);
    if (isNaN(gpaValue) || gpaValue < 0 || gpaValue > 4.0) {
      setError('GPA must be a number between 0 and 4.0');
      return;
    }
    
    // Update student data in state and localStorage
    const updatedStudentData = {
      ...studentData,
      name,
      email,
      major,
      gpa: gpaValue,
      semester
    };
    
    setStudentData(updatedStudentData);
    localStorage.setItem('currentUser', JSON.stringify(updatedStudentData));
    
    // Show success message
    setSuccess('Profile updated successfully!');
    setError('');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };
  
  if (!studentData) {
    return <div>Loading profile editor...</div>;
  }
  
  return (
    <div>
      <Profile 
        name={studentData.name} 
        email={studentData.email}
        role="Student"
        major={studentData.major}
        gpa={studentData.gpa}
        navigateTo="/student/profile"
        showEditButton={false}
      />
      
      <Container className="mb-5">
        <Card className="shadow-sm">
          <Card.Header as="h5">Edit Profile</Card.Header>
          <Card.Body>
            {success && (
              <Alert variant="success">{success}</Alert>
            )}
            {error && (
              <Alert variant="danger">{error}</Alert>
            )}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Major</Form.Label>
                <Form.Select 
                  value={major} 
                  onChange={(e) => setMajor(e.target.value)}
                  required
                >
                  <option value="">Select your major</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Electronics Engineering">Electronics Engineering</option>
                  <option value="Communications Engineering">Communications Engineering</option>
                  <option value="Business Informatics">Business Informatics</option>
                  <option value="Mechatronics">Mechatronics</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>GPA</Form.Label>
                <Form.Control 
                  type="number" 
                  value={gpa} 
                  onChange={(e) => setGpa(e.target.value)}
                  placeholder="Enter your GPA"
                  min="0" 
                  max="4.0" 
                  step="0.1"
                  required
                />
                <Form.Text className="text-muted">
                  Please enter a value between 0 and 4.0
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Label>Current Semester</Form.Label>
                <Form.Select 
                  value={semester} 
                  onChange={(e) => setSemester(e.target.value)}
                >
                  <option value="">Select your current semester</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                  <option value="9">Semester 9</option>
                  <option value="10">Semester 10</option>
                </Form.Select>
              </Form.Group>
              
              <div className="d-flex justify-content-between">
                <Button 
                  variant="secondary" 
                  onClick={() => navigate('/student/profile')}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default StudentEditProfilePage; 