import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';

function ApplicationForm({ onSubmit }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [position, setPosition] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!position.trim()) {
      setError('Please enter the internship position');
      return;
    }
    if (!companyName.trim()) {
      setError('Please enter the company name');
      return;
    }
    if (!supervisor.trim()) {
      setError('Please enter the supervisor name');
      return;
    }
    if (!startDate) {
      setError('Please select a start date');
      return;
    }
    if (!endDate) {
      setError('Please select an end date');
      return;
    }
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      setError('End date must be after start date');
      return;
    }
    
    if (!description.trim()) {
      setError('Please provide a brief description');
      return;
    }

    // Create application object
    const application = {
      id: uuidv4(),
      studentName: currentUser?.name || 'Student',
      studentId: currentUser?.id,
      internshipTitle: position,
      companyName: companyName,
      supervisor: supervisor,
      startDate: startDate,
      endDate: endDate,
      description: description,
      major: currentUser?.major || 'Not specified',
      gpa: currentUser?.gpa || 'Not specified',
      status: 'pending',
      submissionDate: new Date().toISOString()
    };

    // Store in localStorage
    const applications = JSON.parse(localStorage.getItem('pendingApplications') || '[]');
    applications.push(application);
    localStorage.setItem('pendingApplications', JSON.stringify(applications));
    
    // Show success message
    setSuccess('Your application has been submitted successfully!');
    
    // Reset form
    setPosition('');
    setCompanyName('');
    setSupervisor('');
    setStartDate('');
    setEndDate('');
    setDescription('');
    setError('');
    
    // Scroll to top to show success message
    window.scrollTo(0, 0);
    
    // Notify parent component if needed
    if (onSubmit) {
      onSubmit(application);
    }
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccess('');
    }, 5000);
  };

  return (
    <Card className="shadow-sm mb-4">
      <Card.Header as="h5">Internship Application</Card.Header>
      <Card.Body>
        {success && (
          <Alert variant="success" className="mb-4">
            {success}
          </Alert>
        )}
        
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Position Title*</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="E.g., Software Engineer Intern"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Company Name*</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="E.g., Tech Solutions Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Company Supervisor*</Form.Label>
            <Form.Control
              type="text"
              placeholder="E.g., John Smith"
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
              required
            />
            <Form.Text className="text-muted">
              The person who will be supervising you during the internship
            </Form.Text>
          </Form.Group>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date*</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>End Date*</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-4">
            <Form.Label>Description of Internship*</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Describe the internship role, responsibilities, and what you hope to learn..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Form.Group>
          
          <div className="d-grid gap-2">
            <Button variant="primary" type="submit" size="lg">
              Submit Application
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default ApplicationForm; 