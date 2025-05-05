import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert, Tabs, Tab } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ApplicationForm from '../components/ApplicationForm';
import Profile from '../components/Profile';

function StudentHomePage() {
  const [studentData, setStudentData] = useState(null);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [reviewedApplications, setReviewedApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get current user
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setStudentData(JSON.parse(userData));
    } else {
      // Redirect to login if no user data is found
      navigate('/');
    }
    
    // Get pending applications
    const pendingApps = JSON.parse(localStorage.getItem('pendingApplications') || '[]');
    // In a real app, we would filter by the student's ID
    // For now, just using all pending applications for the demo
    setPendingApplications(pendingApps);
    
    // Get reviewed applications
    const reviewedApps = JSON.parse(localStorage.getItem('reviewedApplications') || '[]');
    setReviewedApplications(reviewedApps);
  }, [navigate]);
  
  // Group reviewed applications by status
  const getApplicationsByStatus = (status) => {
    return reviewedApplications.filter(app => app.status === status);
  };
  
  // Handle form submission from ApplicationForm component
  const handleApplicationSubmit = (application) => {
    setPendingApplications([...pendingApplications, application]);
    // Switch to dashboard tab to show the new application
    setActiveTab('dashboard');
  };
  
  // Quick stats for student dashboard
  const stats = {
    pending: pendingApplications.length,
    accepted: getApplicationsByStatus('accepted').length,
    rejected: getApplicationsByStatus('rejected').length,
    flagged: getApplicationsByStatus('flagged').length
  };
  
  if (!studentData) {
    return <div>Loading dashboard...</div>;
  }
  
  return (
    <div>
      <Profile 
        name={studentData.name} 
        email={studentData.email}
        role="Student"
        major={studentData.major}
        gpa={studentData.gpa}
        navigateTo="/student/edit-profile"
        showEditButton={true}
      />
      
      <Container>
        {/* Application Stats */}
        <Row className="mb-4">
          <Col xs={6} md={3}>
            <Card className="text-center" style={{ backgroundColor: '#f8f9fa' }}>
              <Card.Body>
                <h3>{stats.pending}</h3>
                <p className="mb-0">Pending</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="text-center" style={{ backgroundColor: '#d4edda' }}>
              <Card.Body>
                <h3>{stats.accepted}</h3>
                <p className="mb-0">Accepted</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3} className="mt-3 mt-md-0">
            <Card className="text-center" style={{ backgroundColor: '#f8d7da' }}>
              <Card.Body>
                <h3>{stats.rejected}</h3>
                <p className="mb-0">Rejected</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3} className="mt-3 mt-md-0">
            <Card className="text-center" style={{ backgroundColor: '#fff3cd' }}>
              <Card.Body>
                <h3>{stats.flagged}</h3>
                <p className="mb-0">Flagged</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
          fill
        >
          {/* Dashboard Tab */}
          <Tab eventKey="dashboard" title="My Applications">
            <h4 className="mt-4 mb-3">Pending Applications</h4>
            {pendingApplications.length > 0 ? (
              <Row>
                {pendingApplications.map(application => (
                  <Col md={6} lg={4} className="mb-4" key={application.id}>
                    <Card className="h-100" style={{ 
                      borderRadius: '10px', 
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
                      border: 'none',
                      borderLeft: '5px solid #ffc107'
                    }}>
                      <Card.Header style={{ backgroundColor: '#fff3cd', borderBottom: '1px solid #e9ecef' }}>
                        <div className="d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">{application.internshipTitle}</h5>
                          <Badge bg="warning">Pending</Badge>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <p><strong>Company:</strong> {application.companyName}</p>
                        <p><strong>Supervisor:</strong> {application.supervisor}</p>
                        <p><strong>Duration:</strong> {new Date(application.startDate).toLocaleDateString()} - {new Date(application.endDate).toLocaleDateString()}</p>
                        <p><strong>Submitted:</strong> {new Date(application.submissionDate).toLocaleDateString()}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Card className="mb-4">
                <Card.Body className="text-center py-4">
                  <p className="mb-0">No pending applications. Submit a new internship application!</p>
                </Card.Body>
              </Card>
            )}
            
            {/* Reviewed Applications */}
            {reviewedApplications.length > 0 && (
              <>
                <h4 className="mt-4 mb-3">Reviewed Applications</h4>
                <Row>
                  {reviewedApplications.map(application => (
                    <Col md={6} lg={4} className="mb-4" key={application.id}>
                      <Card className="h-100" style={{ 
                        borderRadius: '10px', 
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
                        border: 'none',
                        borderLeft: application.status === 'accepted' 
                          ? '5px solid #28a745' 
                          : application.status === 'rejected'
                            ? '5px solid #dc3545'
                            : '5px solid #ffc107'
                      }}>
                        <Card.Header style={{ 
                          backgroundColor: application.status === 'accepted' 
                            ? '#d4edda' 
                            : application.status === 'rejected'
                              ? '#f8d7da'
                              : '#fff3cd', 
                          borderBottom: '1px solid #e9ecef' 
                        }}>
                          <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">{application.internshipTitle}</h5>
                            <Badge bg={
                              application.status === 'accepted' 
                                ? 'success' 
                                : application.status === 'rejected'
                                  ? 'danger'
                                  : 'warning'
                            }>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </Badge>
                          </div>
                        </Card.Header>
                        <Card.Body>
                          <p><strong>Company:</strong> {application.companyName}</p>
                          <p><strong>Review Date:</strong> {new Date(application.reviewDate).toLocaleDateString()}</p>
                          
                          {application.comment && (
                            <div className="mt-2">
                              <p><strong>Faculty Comments:</strong></p>
                              <p className="p-2 bg-light rounded mb-0">{application.comment}</p>
                            </div>
                          )}
                        </Card.Body>
                        
                        {application.status === 'accepted' && (
                          <Card.Footer style={{ backgroundColor: 'white', borderTop: '1px solid #e9ecef' }}>
                            <div className="d-grid">
                              <Button 
                                variant="outline-primary"
                                onClick={() => navigate('/student/approved-applications')}
                              >
                                View Internship Details
                              </Button>
                            </div>
                          </Card.Footer>
                        )}
                      </Card>
                    </Col>
                  ))}
                </Row>
              </>
            )}
          </Tab>
          
          {/* Apply for Internship Tab */}
          <Tab eventKey="apply" title="Apply for Internship">
            <h4 className="mt-4 mb-3">Submit a New Internship Application</h4>
            <ApplicationForm onSubmit={handleApplicationSubmit} />
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
}

export default StudentHomePage; 