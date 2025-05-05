import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function StudentHomePageWithApprovedApplications() {
  const [currentUser, setCurrentUser] = useState(null);
  const [approvedApplications, setApprovedApplications] = useState([]);
  const [internshipDetails, setInternshipDetails] = useState([]);
  
  useEffect(() => {
    // Get current user
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    
    // Get all reviewed applications
    const reviewedApplications = JSON.parse(localStorage.getItem('reviewedApplications') || '[]');
    
    // Filter for accepted applications for this student
    // In a real app, we would filter by the student's ID
    const acceptedApps = reviewedApplications.filter(app => app.status === 'accepted');
    setApprovedApplications(acceptedApps);
    
    // Get internship details
    const details = JSON.parse(localStorage.getItem('internshipDetails') || '[]');
    setInternshipDetails(details);
  }, []);
  
  // Check if internship details have been submitted for an application
  const hasSubmittedDetails = (applicationId) => {
    return internshipDetails.some(detail => detail.applicationId === applicationId);
  };
  
  // Get internship details for an application
  const getDetailsForApplication = (applicationId) => {
    return internshipDetails.find(detail => detail.applicationId === applicationId);
  };
  
  return (
    <Container className="my-4">
      <h2 className="mb-4">Student Dashboard</h2>
      
      {/* Approved Applications Section */}
      <h3 className="mb-3">Approved Internship Applications</h3>
      
      {approvedApplications.length > 0 ? (
        <Row>
          {approvedApplications.map(application => {
            const hasDetails = hasSubmittedDetails(application.id);
            const details = hasDetails ? getDetailsForApplication(application.id) : null;
            
            return (
              <Col md={6} className="mb-4" key={application.id}>
                <Card style={{ 
                  borderRadius: '10px', 
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
                  border: 'none',
                  borderLeft: '5px solid #28a745'
                }}>
                  <Card.Header style={{ backgroundColor: '#d4edda', borderBottom: '1px solid #e9ecef' }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">{application.internshipTitle}</h5>
                      <Badge bg="success">Approved</Badge>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <p><strong>Application Date:</strong> {new Date(application.reviewDate).toLocaleDateString()}</p>
                    
                    {hasDetails ? (
                      <>
                        <Alert variant="success" className="p-2 mb-3">
                          <small>You have submitted the internship details</small>
                        </Alert>
                        <p><strong>Company:</strong> {details.companyName}</p>
                        <p><strong>Supervisor:</strong> {details.supervisor}</p>
                        <p><strong>Duration:</strong> {new Date(details.startDate).toLocaleDateString()} - {new Date(details.endDate).toLocaleDateString()}</p>
                      </>
                    ) : (
                      <Alert variant="warning" className="p-2 mb-3">
                        <small>Please submit your internship details</small>
                      </Alert>
                    )}
                    
                    {application.comment && (
                      <div className="mt-2">
                        <p><strong>Faculty Comments:</strong></p>
                        <p className="p-2 bg-light rounded mb-0">{application.comment}</p>
                      </div>
                    )}
                  </Card.Body>
                  <Card.Footer style={{ backgroundColor: 'white', borderTop: '1px solid #e9ecef' }}>
                    <div className="d-grid">
                      <Link 
                        to={`/student/internship-details/${application.id}`}
                        className={`btn btn-${hasDetails ? 'outline-primary' : 'primary'}`}
                      >
                        {hasDetails ? 'Update Internship Details' : 'Submit Internship Details'}
                      </Link>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        <Card className="mb-4">
          <Card.Body className="text-center py-4">
            <p className="mb-0">No approved internship applications yet.</p>
          </Card.Body>
        </Card>
      )}
      
      {/* Rest of the Student Dashboard content would go here */}
    </Container>
  );
}

export default StudentHomePageWithApprovedApplications; 