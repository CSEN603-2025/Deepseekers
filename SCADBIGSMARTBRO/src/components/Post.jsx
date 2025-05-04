import React from 'react';
import { Card, Badge, Button, Row, Col } from 'react-bootstrap';
import '../css/Post.css';

function Post({ internship, isStudent = true }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <Card className="internship-post">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="post-title">{internship.title}</h5>
          {internship.paid ? (
            <Badge className="status-badge paid">Paid</Badge>
          ) : (
            <Badge className="status-badge unpaid">Unpaid</Badge>
          )}
        </div>
        <div className="company-name">
          {internship.companyName && <span>{internship.companyName}</span>}
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
          <div className="posting-date">
            <span className="info-label">Posted:</span> 
            <span className="posting-date-value">{formatDate(internship.date)}</span>
          </div>
          {isStudent ? (
            <Button className="action-button apply-button">Apply Now</Button>
          ) : (
            <Button className="action-button view-button">View Applications</Button>
          )}
        </div>
      </Card.Footer>
    </Card>
  );
}

export default Post;