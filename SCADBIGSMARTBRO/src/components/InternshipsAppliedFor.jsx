import React, { useState, useEffect } from 'react';
import { Card, Badge, ListGroup, Row, Col, Button } from 'react-bootstrap';
import '../css/StudentProfilePage.css';

function InternshipsAppliedFor() {
  const [applications, setApplications] = useState([]);
  
  // Load applications from localStorage
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
      const allApplications = JSON.parse(localStorage.getItem('appliedInternships')) || [];
      // Filter applications for this student
      const studentApplications = allApplications.filter(
        app => app.studentId === currentUser.id
      );
      setApplications(studentApplications);
    }
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadgeVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'finalized': 
        return 'info';
      case 'pending':
      default:
        return 'warning';
    }
  };

  const getStatusLabel = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending Review';
      case 'finalized':
        return 'Finalized';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Not Selected';
      default:
        return status;
    }
  };

  const getStatusDescription = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Your application has been submitted and is waiting to be reviewed.';
      case 'finalized':
        return 'Congratulations! You\'ve been Shortlisted as one of the top candidates.';
      case 'accepted':
        return 'Congratulations! Your application has been accepted.';
      case 'rejected':
        return 'Thank you for your interest. This position has been filled.';
      default:
        return '';
    }
  };

  return (
    <Card className="internships-applied-card">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Internships Applied For</h5>
        <Badge bg="primary" pill>
          {applications.length}
        </Badge>
      </Card.Header>
      
      <Card.Body className="p-0">
        {applications.length > 0 ? (
          <ListGroup variant="flush">
            {applications.map(application => (
              <ListGroup.Item key={application.id} className="application-item">
                <Row>
                  <Col md={8}>
                    <h6 className="internship-title">{application.internshipTitle}</h6>
                    <div className="company-name">{application.companyName}</div>
                    <div className="application-date">
                      Applied on {formatDate(application.applicationDate)}
                    </div>
                  </Col>
                  <Col md={4} className="d-flex flex-column align-items-end justify-content-between">
                    <div className="status-container">
                      <Badge 
                        bg={getStatusBadgeVariant(application.status)}
                        className={`status-badge status-${application.status.toLowerCase()}`}
                      >
                        {getStatusLabel(application.status)}
                      </Badge>
                      <small className="status-description text-muted">
                        {getStatusDescription(application.status)}
                      </small>
                    </div>
                   
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <div className="no-applications p-4 text-center">
            <p className="text-muted mb-0">You haven't applied to any internships yet.</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default InternshipsAppliedFor;
