import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

function ApplicationReviewModal({ show, onHide, application }) {
  const [status, setStatus] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset form on new application or when modal is opened
  React.useEffect(() => {
    if (show) {
      setStatus('');
      setComment('');
      setError('');
      setSuccess('');
    }
  }, [show, application]);

  const handleSubmit = () => {
    // Validate form
    if (!status) {
      setError('Please select a status');
      return;
    }

    if ((status === 'rejected' || status === 'flagged') && !comment) {
      setError('Please provide a comment explaining why the application is ' + status);
      return;
    }

    // In a real app, we would save this to a database or API
    // For now, just simulate a successful update
    const updatedApplication = {
      ...application,
      status,
      comment,
      reviewDate: new Date().toISOString()
    };

    // We would typically make an API call here
    console.log('Application updated:', updatedApplication);
    
    // For demonstration, store in localStorage to persist the data
    const reviewedApplications = JSON.parse(localStorage.getItem('reviewedApplications') || '[]');
    
    // Check if this application was already reviewed
    const existingIndex = reviewedApplications.findIndex(app => app.id === application.id);
    if (existingIndex >= 0) {
      reviewedApplications[existingIndex] = updatedApplication;
    } else {
      reviewedApplications.push(updatedApplication);
    }
    
    localStorage.setItem('reviewedApplications', JSON.stringify(reviewedApplications));
    
    // Show success message
    setSuccess(`Application has been marked as ${status.toUpperCase()}`);
    
    // Clear error if any
    setError('');
    
    // Close modal after a delay
    setTimeout(() => {
      onHide(updatedApplication);
    }, 1500);
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Review Internship Application</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {application && (
          <>
            <div className="mb-4">
              <h5>Student Information</h5>
              <p><strong>Name:</strong> {application.studentName}</p>
              <p><strong>Major:</strong> {application.major}</p>
              <p><strong>GPA:</strong> {application.gpa}</p>
            </div>
            
            <div className="mb-4">
              <h5>Internship Details</h5>
              <p><strong>Position:</strong> {application.internshipTitle}</p>
              <p><strong>Company:</strong> {application.companyName}</p>
              <p><strong>Supervisor:</strong> {application.supervisor}</p>
              <p><strong>Duration:</strong> {new Date(application.startDate).toLocaleDateString()} - {new Date(application.endDate).toLocaleDateString()}</p>
              <div>
                <strong>Description:</strong>
                <p className="p-2 bg-light rounded mt-1">{application.description}</p>
              </div>
            </div>

            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Set Application Status</Form.Label>
                <Form.Select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  isInvalid={!!error && !status}
                >
                  <option value="">Select Status</option>
                  <option value="accepted">Accept</option>
                  <option value="rejected">Reject</option>
                  <option value="flagged">Flag for Review</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  {status === 'rejected' 
                    ? 'Rejection Reason (Required)' 
                    : status === 'flagged' 
                      ? 'Reason for Flagging (Required)' 
                      : 'Additional Comments (Optional)'}
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Enter your comments here..."
                  isInvalid={!!error && (status === 'rejected' || status === 'flagged') && !comment}
                />
                <Form.Text muted>
                  {status === 'rejected' || status === 'flagged' 
                    ? 'Please provide a detailed explanation to help the student understand your decision.'
                    : 'Any additional notes for the accepted application.'}
                </Form.Text>
              </Form.Group>
            </Form>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant={
            status === 'accepted' ? 'success' : 
            status === 'rejected' ? 'danger' : 
            status === 'flagged' ? 'warning' : 
            'primary'
          } 
          onClick={handleSubmit}
        >
          Submit Review
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ApplicationReviewModal; 