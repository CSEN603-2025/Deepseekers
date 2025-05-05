import React, { useState } from 'react';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';

function InternshipDetailsForm({ applicationId, onDetailsSubmitted }) {
  const [companyName, setCompanyName] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!companyName) {
      setError('Please provide the company name');
      return;
    }
    if (!supervisor) {
      setError('Please provide the company supervisor');
      return;
    }
    if (!startDate) {
      setError('Please provide the start date');
      return;
    }
    if (!endDate) {
      setError('Please provide the end date');
      return;
    }
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      setError('End date must be after start date');
      return;
    }

    // Create the internship details object
    const internshipDetails = {
      applicationId,
      companyName,
      supervisor,
      startDate,
      endDate,
      submittedDate: new Date().toISOString()
    };

    // In a real app, we would save this to a database or API
    // For now, store in localStorage
    const internshipDetailsList = JSON.parse(localStorage.getItem('internshipDetails') || '[]');
    
    // Check if details for this application already exist
    const existingIndex = internshipDetailsList.findIndex(item => item.applicationId === applicationId);
    if (existingIndex >= 0) {
      internshipDetailsList[existingIndex] = internshipDetails;
    } else {
      internshipDetailsList.push(internshipDetails);
    }
    
    localStorage.setItem('internshipDetails', JSON.stringify(internshipDetailsList));
    
    // Show success message
    setSuccess('Internship details have been successfully submitted');
    
    // Clear error if any
    setError('');
    
    // Notify parent component that details were submitted
    if (onDetailsSubmitted) {
      onDetailsSubmitted(internshipDetails);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header as="h5">Internship Details</Card.Header>
      <Card.Body>
        <p className="mb-3">
          Please provide the details about your internship. This information will be reviewed by your faculty academic.
        </p>
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Company Name</Form.Label>
            <Form.Control
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Company Supervisor</Form.Label>
            <Form.Control
              type="text"
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
              placeholder="Enter supervisor name"
              required
            />
            <Form.Text muted>
              This is the main person you'll be reporting to during your internship
            </Form.Text>
          </Form.Group>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
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
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <div className="d-grid gap-2 mt-4">
            <Button variant="primary" type="submit">
              Submit Internship Details
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default InternshipDetailsForm; 