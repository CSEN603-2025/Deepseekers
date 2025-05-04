import React, { useState } from 'react';
import { Card, Badge, Button, Row, Col } from 'react-bootstrap';
import ApplicationForm from './ApplicationForm';
import '../css/Post.css';

function Post({ internship, isStudent = true }) {
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleApplyClick = () => {
    setShowApplicationForm(true);
  };

  const handleApplicationFormClose = () => {
    setShowApplicationForm(false);
  };

  // Check if the current user has already applied for this internship
  const hasApplied = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return false;
    
    const appliedInternships = JSON.parse(localStorage.getItem('appliedInternships')) || [];
    return appliedInternships.some(
      application => application.internshipId === internship.id && application.studentId === currentUser.id
    );
  };
  
  const alreadyApplied = hasApplied();

  return (
    <Card className="internship-post">
      <Card.Header>
        {/* Company name at the top, prominently displayed */}
        <div className="company-name-container">
          <h4 className="company-name">
            {internship.companyName || 'Company Name Not Available'}
          </h4>
        </div>
        
        {/* Internship title with clear label */}
        <div className="d-flex justify-content-between align-items-center mt-2">
          <div className="internship-title-container">
            <span className="internship-label">Internship Position:</span>
            <span className="post-title">{internship.title}</span>
          </div>
          {internship.paid ? (
            <Badge className="status-badge paid">Paid</Badge>
          ) : (
            <Badge className="status-badge unpaid">Unpaid</Badge>
          )}
        </div>
      </Card.Header>
      
      <Card.Body>
        {/* Department Section */}
        {internship.department && (
          <div className="info-section department-section">
            <span className="info-label">Department:</span>
            <span className="info-value">{internship.department}</span>
          </div>
        )}
        
        {/* Description Section */}
        <div className="info-section description-section">
          <h6 className="section-title">Description:</h6>
          <p className="description">{internship.description}</p>
        </div>
        
        {/* Requirements Section */}
        {internship.requirements && (
          <div className="info-section requirements-section">
            <h6 className="section-title">Requirements:</h6>
            <p className="requirements">{internship.requirements}</p>
          </div>
        )}
        
        {/* Key Details Section */}
        <Row className="info-section details-section">
          <Col md={4} className="detail-column">
            <div className="detail-item">
              <span className="info-label"><i className="bi bi-geo-alt"></i> Location:</span>
              <span className="info-value">{internship.location || 'Not specified'}</span>
            </div>
          </Col>
          <Col md={4} className="detail-column">
            <div className="detail-item">
              <span className="info-label"><i className="bi bi-clock"></i> Duration:</span>
              <span className="info-value">{internship.duration || 'Not specified'}</span>
            </div>
          </Col>
          {internship.paid && internship.salary && (
            <Col md={4} className="detail-column">
              <div className="detail-item">
                <span className="info-label"><i className="bi bi-cash"></i> Compensation:</span>
                <span className="info-value highlight">{internship.salary}</span>
              </div>
            </Col>
          )}
        </Row>
        
        {/* Dates Section */}
        <Row className="info-section dates-section">
          <Col md={6}>
            <div className="date-item">
              <span className="info-label">Application Deadline:</span>
              <span className="info-value deadline">{formatDate(internship.deadline)}</span>
            </div>
          </Col>
          {internship.startDate && (
            <Col md={6}>
              <div className="date-item">
                <span className="info-label">Start Date:</span>
                <span className="info-value">{formatDate(internship.startDate)}</span>
              </div>
            </Col>
          )}
        </Row>
        
        {/* Additional Information */}
        {internship.additionalInfo && (
          <div className="info-section additional-info-section">
            <h6 className="section-title">Additional Information:</h6>
            <p>{internship.additionalInfo}</p>
          </div>
        )}
      </Card.Body>
      
      <Card.Footer>
        <div className="d-flex justify-content-between align-items-center">
          <div className="posting-info">
            <div className="posting-date">
              <span className="info-label">Posted:</span> 
              <span className="posting-date-value">{formatDate(internship.date)}</span>
            </div>
            {internship.applicantsCount !== undefined && (
              <div className="applicants-count">
                <span className="info-label">Applicants:</span>
                <span className="applicants-count-value">{internship.applicantsCount || 0}</span>
              </div>
            )}
          </div>
          
          {isStudent ? (
            alreadyApplied ? (
              <Button className="action-button already-applied-button" disabled>
                Already Applied
              </Button>
            ) : (
              <Button 
                className="action-button apply-button" 
                onClick={handleApplyClick}
              >
                Apply Now
              </Button>
            )
          ) : (
            <Button className="action-button view-button">
              View Applications ({internship.applicantsCount || 0})
            </Button>
          )}
        </div>
      </Card.Footer>
      
      {/* Application Form Modal */}
      <ApplicationForm 
        show={showApplicationForm} 
        onHide={handleApplicationFormClose} 
        internship={internship}
      />
    </Card>
  );
}

export default Post;