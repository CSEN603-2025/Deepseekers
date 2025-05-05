import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Profile from '../components/Profile';

function FacultyEditProfilePage() {
  const [facultyData, setFacultyData] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [officeHours, setOfficeHours] = useState('');
  const [officeLocation, setOfficeLocation] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load faculty data from localStorage
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      setFacultyData(parsedUserData);
      
      // Initialize form fields with current values
      setName(parsedUserData.name || '');
      setEmail(parsedUserData.email || '');
      setDepartment(parsedUserData.department || '');
      setOfficeHours(parsedUserData.officeHours || '');
      setOfficeLocation(parsedUserData.officeLocation || '');
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
    if (!department.trim()) {
      setError('Department is required');
      return;
    }
    
    // Update faculty data in state and localStorage
    const updatedFacultyData = {
      ...facultyData,
      name,
      email,
      department,
      officeHours,
      officeLocation
    };
    
    setFacultyData(updatedFacultyData);
    localStorage.setItem('currentUser', JSON.stringify(updatedFacultyData));
    
    // Show success message
    setSuccess('Profile updated successfully!');
    setError('');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };
  
  if (!facultyData) {
    return <div>Loading profile editor...</div>;
  }
  
  return (
    <div>
      <Profile 
        name={facultyData.name} 
        email={facultyData.email}
        role="Faculty Member"
        department={facultyData.department}
        navigateTo="/faculty/dashboard"
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
                <Form.Label>Department</Form.Label>
                <Form.Select 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                >
                  <option value="">Select your department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Electronics Engineering">Electronics Engineering</option>
                  <option value="Communications Engineering">Communications Engineering</option>
                  <option value="Business Informatics">Business Informatics</option>
                  <option value="Mechatronics">Mechatronics</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Office Hours</Form.Label>
                <Form.Control 
                  type="text" 
                  value={officeHours} 
                  onChange={(e) => setOfficeHours(e.target.value)}
                  placeholder="Enter your office hours (e.g., Mon 10-12, Wed 2-4)"
                />
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Label>Office Location</Form.Label>
                <Form.Control 
                  type="text" 
                  value={officeLocation} 
                  onChange={(e) => setOfficeLocation(e.target.value)}
                  placeholder="Enter your office location (e.g., C7.305)"
                />
              </Form.Group>
              
              <div className="d-flex justify-content-between">
                <Button 
                  variant="secondary" 
                  onClick={() => navigate('/faculty/dashboard')}
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

export default FacultyEditProfilePage; 