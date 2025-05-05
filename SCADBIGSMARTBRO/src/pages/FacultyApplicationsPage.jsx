import React, { useState, useEffect } from "react";
import ApplicationReviewModal from "../components/ApplicationReviewModal";
import { Card, Badge, Button, Container, Row, Col, Tabs, Tab, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

function FacultyApplicationReviewPage() {
  const [facultyData, setFacultyData] = useState(null);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [reviewedApplications, setReviewedApplications] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();
  
  // Load faculty data and applications from localStorage
  useEffect(() => {
    // Get user data
    const userData = localStorage.getItem('currentUser');
    
    if (userData) {
      setFacultyData(JSON.parse(userData));
    } else {
      // Redirect to login if no user data is found
      navigate('/');
    }
    
    // Load pending applications from localStorage
    const storedPendingApplications = JSON.parse(localStorage.getItem('pendingApplications') || '[]');
    setPendingApplications(storedPendingApplications);
    
    // Load reviewed applications from localStorage
    const storedReviewedApplications = JSON.parse(localStorage.getItem('reviewedApplications') || '[]');
    setReviewedApplications(storedReviewedApplications);
    
  }, [navigate]);
  
  // Handle opening the review modal
  const handleReviewApplication = (application) => {
    setSelectedApplication(application);
    setShowReviewModal(true);
  };
  
  // Handle closing the review modal and process results
  const handleModalClose = (updatedApplication) => {
    setShowReviewModal(false);
    
    // If we have updated application data (meaning form was submitted successfully)
    if (updatedApplication && updatedApplication.status) {
      // Add to reviewed applications
      const updatedReviewedApps = [...reviewedApplications];
      const existingIndex = updatedReviewedApps.findIndex(app => app.id === updatedApplication.id);
      
      if (existingIndex >= 0) {
        updatedReviewedApps[existingIndex] = updatedApplication;
      } else {
        updatedReviewedApps.push(updatedApplication);
      }
      
      setReviewedApplications(updatedReviewedApps);
      
      // Remove from pending applications
      setPendingApplications(pendingApplications.filter(app => app.id !== updatedApplication.id));
      
      // Remove from pending applications in localStorage
      const storedPendingApplications = JSON.parse(localStorage.getItem('pendingApplications') || '[]');
      const updatedPendingApps = storedPendingApplications.filter(app => app.id !== updatedApplication.id);
      localStorage.setItem('pendingApplications', JSON.stringify(updatedPendingApps));
    }
  };
  
  // Filter applications based on search term and status filter
  const getFilteredApplications = (applications, isReviewed = false) => {
    return applications.filter(app => {
      // Text search
      const matchesSearch = 
        searchTerm === "" || 
        app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.major.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.internshipTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.companyName && app.companyName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Status filter (only for reviewed applications)
      const matchesStatus = 
        !isReviewed || 
        filterStatus === "all" || 
        app.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  };
  
  const filteredPendingApplications = getFilteredApplications(pendingApplications);
  const filteredReviewedApplications = getFilteredApplications(reviewedApplications, true);
  
  // Group reviewed applications by status
  const getApplicationsByStatus = (status) => {
    return reviewedApplications.filter(app => app.status === status);
  };
  
  if (!facultyData) {
    return <div>Loading applications...</div>;
  }
  
  return (
    <Container className="mt-4 mb-5">
      <h2 className="mb-4">Application Review</h2>
      
      {/* Search and Filter */}
      <Card className="mb-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', border: 'none' }}>
        <Card.Body>
          <Row>
            <Col md={8}>
              <Form.Group>
                <Form.Label>Search Applications</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by student name, major, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filter by Status</Form.Label>
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Applications</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="flagged">Flagged</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Application Stats */}
      <Row className="mb-4">
        <Col xs={6} md={3}>
          <Card className="text-center" style={{ backgroundColor: '#f8f9fa' }}>
            <Card.Body>
              <h3>{pendingApplications.length}</h3>
              <p className="mb-0">Pending</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="text-center" style={{ backgroundColor: '#d4edda' }}>
            <Card.Body>
              <h3>{getApplicationsByStatus('accepted').length}</h3>
              <p className="mb-0">Accepted</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3} className="mt-3 mt-md-0">
          <Card className="text-center" style={{ backgroundColor: '#f8d7da' }}>
            <Card.Body>
              <h3>{getApplicationsByStatus('rejected').length}</h3>
              <p className="mb-0">Rejected</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3} className="mt-3 mt-md-0">
          <Card className="text-center" style={{ backgroundColor: '#fff3cd' }}>
            <Card.Body>
              <h3>{getApplicationsByStatus('flagged').length}</h3>
              <p className="mb-0">Flagged</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Applications Tabs */}
      <Tabs defaultActiveKey="pending" id="applications-tabs" className="mb-4">
        {/* Pending Applications Tab */}
        <Tab eventKey="pending" title="Pending Applications">
          <Row>
            {filteredPendingApplications.length > 0 ? (
              filteredPendingApplications.map((application) => (
                <Col md={6} lg={4} className="mb-3" key={application.id}>
                  <Card style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', border: 'none', height: '100%' }}>
                    <Card.Header style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h5 style={{ margin: 0, fontSize: '1rem' }}>{application.studentName}</h5>
                        <Badge bg="warning">Pending</Badge>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <p className="mb-1"><strong>Position:</strong> {application.internshipTitle}</p>
                      <p className="mb-1"><strong>Company:</strong> {application.companyName}</p>
                      <p className="mb-1"><strong>Major:</strong> {application.major}</p>
                      <p className="mb-1"><strong>GPA:</strong> {application.gpa}</p>
                      <p className="mb-1"><strong>Duration:</strong> {new Date(application.startDate).toLocaleDateString()} - {new Date(application.endDate).toLocaleDateString()}</p>
                      <p className="mb-1"><strong>Applied:</strong> {new Date(application.submissionDate).toLocaleDateString()}</p>
                    </Card.Body>
                    <Card.Footer style={{ backgroundColor: 'white', borderTop: '1px solid #e9ecef' }}>
                      <div className="d-grid">
                        <Button 
                          variant="primary" 
                          onClick={() => handleReviewApplication(application)}
                        >
                          Review Application
                        </Button>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))
            ) : (
              <Col>
                <Card style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', border: 'none' }}>
                  <Card.Body className="text-center py-5">
                    <p className="mb-0">No pending applications to review.</p>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        </Tab>
        
        {/* Reviewed Applications Tab */}
        <Tab eventKey="reviewed" title="Reviewed Applications">
          <Row>
            {filteredReviewedApplications.length > 0 ? (
              filteredReviewedApplications.map((application) => (
                <Col md={6} lg={4} className="mb-3" key={application.id}>
                  <Card style={{ 
                    borderRadius: '10px', 
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
                    border: 'none', 
                    height: '100%',
                    borderLeft: application.status === 'rejected' 
                      ? '5px solid #dc3545' 
                      : application.status === 'flagged' 
                        ? '5px solid #ffc107' 
                        : application.status === 'accepted'
                          ? '5px solid #28a745'
                          : 'none'
                  }}>
                    <Card.Header style={{ 
                      backgroundColor: application.status === 'rejected' 
                        ? '#f8d7da' 
                        : application.status === 'flagged' 
                          ? '#fff3cd' 
                          : application.status === 'accepted'
                            ? '#d4edda'
                            : '#f8f9fa', 
                      borderBottom: '1px solid #e9ecef' 
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h5 style={{ margin: 0, fontSize: '1rem' }}>{application.studentName}</h5>
                        <Badge bg={
                          application.status === 'rejected' 
                            ? 'danger' 
                            : application.status === 'flagged' 
                              ? 'warning' 
                              : 'success'
                        }>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <p className="mb-1"><strong>Position:</strong> {application.internshipTitle}</p>
                      <p className="mb-1"><strong>Company:</strong> {application.companyName}</p>
                      <p className="mb-1"><strong>Supervisor:</strong> {application.supervisor}</p>
                      <p className="mb-1"><strong>Duration:</strong> {new Date(application.startDate).toLocaleDateString()} - {new Date(application.endDate).toLocaleDateString()}</p>
                      <p className="mb-1"><strong>Reviewed:</strong> {new Date(application.reviewDate).toLocaleDateString()}</p>
                      
                      <div className="mt-2">
                        <strong>Comments:</strong>
                        <p style={{ 
                          padding: '8px', 
                          backgroundColor: '#f8f9fa', 
                          borderRadius: '5px',
                          marginTop: '5px',
                          fontSize: '0.9rem'
                        }}>
                          {application.comment || 'No comments provided.'}
                        </p>
                      </div>
                    </Card.Body>
                    <Card.Footer style={{ backgroundColor: 'white', borderTop: '1px solid #e9ecef' }}>
                      <div className="d-grid">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleReviewApplication(application)}
                        >
                          Update Review
                        </Button>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))
            ) : (
              <Col>
                <Card style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', border: 'none' }}>
                  <Card.Body className="text-center py-5">
                    <p className="mb-0">No reviewed applications found.</p>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        </Tab>
      </Tabs>
      
      {/* Application Review Modal */}
      <ApplicationReviewModal 
        show={showReviewModal}
        onHide={handleModalClose}
        application={selectedApplication}
      />
    </Container>
  );
}

export default FacultyApplicationReviewPage; 