import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, ListGroup, Tabs, Tab, Button, Modal, Form } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import '../css/CompanyDashBoard.css';

function CompanyApplications() {
  const [currentUser, setCurrentUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get current user and load applications
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    setCurrentUser(user);
    
    if (user && user.type === 'company') {
      loadApplications(user.id);
    }
  }, []);
  
  // Load applications for company's internships
  const loadApplications = (companyId) => {
    // Get all internships
    const allInternships = JSON.parse(localStorage.getItem('postedInternships')) || [];
    
    // Filter internships by company
    const companyInternships = allInternships.filter(internship => internship.companyId === companyId);
    
    // Collect all applications from these internships
    let allApplications = [];
    companyInternships.forEach(internship => {
      if (internship.applications && internship.applications.length > 0) {
        // Add internship details to each application
        const applicationsWithDetails = internship.applications.map(app => ({
          ...app,
          internshipTitle: internship.title,
          department: internship.department
        }));
        allApplications = [...allApplications, ...applicationsWithDetails];
      }
    });
    
    setApplications(allApplications);
    setFilteredApplications(allApplications);
  };
  
  // Filter applications based on status and search query
  useEffect(() => {
    let filtered = applications;
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status.toLowerCase() === statusFilter);
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.studentName.toLowerCase().includes(query) ||
        app.internshipTitle.toLowerCase().includes(query) ||
        (app.department && app.department.toLowerCase().includes(query))
      );
    }
    
    setFilteredApplications(filtered);
  }, [statusFilter, searchQuery, applications]);
  
  // Handle application detail view
  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };
  
  // Update application status
  const handleStatusChange = (applicationId, newStatus) => {
    // Update in applications state
    const updatedApplications = applications.map(app => {
      if (app.id === applicationId) {
        return { ...app, status: newStatus };
      }
      return app;
    });
    setApplications(updatedApplications);
    
    // Update in localStorage (both in postedInternships and appliedInternships)
    updateApplicationInStorage(applicationId, newStatus);
    
    // Close modal
    setShowModal(false);
  };
  
  // Update application status in localStorage
  const updateApplicationInStorage = (applicationId, newStatus) => {
    // Update in postedInternships
    const allInternships = JSON.parse(localStorage.getItem('postedInternships')) || [];
    const updatedInternships = allInternships.map(internship => {
      if (internship.applications) {
        internship.applications = internship.applications.map(app => {
          if (app.id === applicationId) {
            return { ...app, status: newStatus };
          }
          return app;
        });
      }
      return internship;
    });
    localStorage.setItem('postedInternships', JSON.stringify(updatedInternships));
    
    // Update in appliedInternships
    const appliedInternships = JSON.parse(localStorage.getItem('appliedInternships')) || [];
    const updatedAppliedInternships = appliedInternships.map(app => {
      if (app.id === applicationId) {
        return { ...app, status: newStatus };
      }
      return app;
    });
    localStorage.setItem('appliedInternships', JSON.stringify(updatedAppliedInternships));
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Get badge variant based on status
  const getStatusBadgeVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'accepted': return 'success';
      case 'rejected': return 'danger';
      case 'finalized': return 'info';
      case 'pending': default: return 'warning';
    }
  };
  
  // If not logged in or not a company, redirect to login
  if (!currentUser || currentUser.type !== 'company') {
    return <Navigate to="/login" />;
  }
  
  return (
    <Container fluid className="company-dashboard">
      <Row className="mb-4">
        <Col>
          <h2 className="page-title">Internship Applications</h2>
          <p className="text-muted">
            Manage and review applications for your internship positions
          </p>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={8}>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Search by student name, internship title or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="finalized">Shortlisted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      
      <Card className="applications-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Applications Received</h5>
          <Badge bg="primary" pill>
            {filteredApplications.length}
          </Badge>
        </Card.Header>
        
        <Card.Body className="p-0">
          {filteredApplications.length > 0 ? (
            <ListGroup variant="flush">
              {filteredApplications.map(application => (
                <ListGroup.Item key={application.id} className="application-item">
                  <Row>
                    <Col md={6}>
                      <h6 className="student-name">{application.studentName}</h6>
                      <div className="internship-title">{application.internshipTitle}</div>
                      {application.department && (
                        <div className="department">{application.department}</div>
                      )}
                      <div className="application-date">
                        Applied on {formatDate(application.applicationDate)}
                      </div>
                    </Col>
                    <Col md={3} className="d-flex flex-column align-items-center justify-content-center">
                      <Badge 
                        bg={getStatusBadgeVariant(application.status)}
                        className="status-badge"
                      >
                        {application.status}
                      </Badge>
                    </Col>
                    <Col md={3} className="d-flex align-items-center justify-content-end">
                      <Button 
                        variant="outline-primary" 
                        onClick={() => handleViewApplication(application)}
                      >
                        View Details
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <div className="no-applications p-4 text-center">
              <p className="text-muted mb-0">No applications found matching your criteria.</p>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Application Detail Modal */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        size="lg"
        centered
      >
        {selectedApplication && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>
                Application from {selectedApplication.studentName}
                <div className="small text-muted">
                  For: {selectedApplication.internshipTitle}
                </div>
              </Modal.Title>
            </Modal.Header>
            
            <Modal.Body>
              <Row className="mb-4">
                <Col md={6}>
                  <h6>Student Information</h6>
                  <p><strong>Name:</strong> {selectedApplication.studentName}</p>
                  <p><strong>Email:</strong> {selectedApplication.studentEmail}</p>
                  <p><strong>Applied:</strong> {formatDate(selectedApplication.applicationDate)}</p>
                </Col>
                <Col md={6}>
                  <h6>Application Status</h6>
                  <Badge 
                    bg={getStatusBadgeVariant(selectedApplication.status)}
                    className="status-badge mb-2"
                    style={{ fontSize: '0.9rem', padding: '8px 12px' }}
                  >
                    {selectedApplication.status}
                  </Badge>
                  <p className="mt-2">
                    <strong>Current status:</strong> {selectedApplication.status}
                  </p>
                </Col>
              </Row>
              
              <hr />
              
              <div className="mb-4">
                <h6>Cover Letter</h6>
                <p>{selectedApplication.coverLetter}</p>
              </div>
              
              <div className="mb-4">
                <h6>Why Applying</h6>
                <p>{selectedApplication.whyApplying}</p>
              </div>
              
              <div className="mb-4">
                <h6>Relevant Experience</h6>
                <p>{selectedApplication.relevantExperience}</p>
              </div>
              
              <hr />
              
              <div className="mb-4">
                <h6>Attached Documents</h6>
                <ListGroup variant="flush">
                  {selectedApplication.resumeBase64 && (
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Resume</span>
                      <a 
                        href={selectedApplication.resumeBase64} 
                        download="resume.pdf"
                        className="btn btn-sm btn-outline-secondary"
                      >
                        Download
                      </a>
                    </ListGroup.Item>
                  )}
                  
                  {selectedApplication.certificateBase64 && (
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Certificate</span>
                      <a 
                        href={selectedApplication.certificateBase64} 
                        download="certificate.pdf"
                        className="btn btn-sm btn-outline-secondary"
                      >
                        Download
                      </a>
                    </ListGroup.Item>
                  )}
                  
                  {selectedApplication.otherDocBase64 && (
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Additional Document</span>
                      <a 
                        href={selectedApplication.otherDocBase64} 
                        download="document.pdf"
                        className="btn btn-sm btn-outline-secondary"
                      >
                        Download
                      </a>
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </div>
            </Modal.Body>
            
            <Modal.Footer className="justify-content-between">
              <div>
                <Button 
                  variant="outline-danger" 
                  onClick={() => handleStatusChange(selectedApplication.id, 'rejected')}
                >
                  Reject
                </Button>
              </div>
              <div>
                <Button 
                  variant="outline-info" 
                  className="me-2"
                  onClick={() => handleStatusChange(selectedApplication.id, 'finalized')}
                >
                  Shortlist
                </Button>
                <Button 
                  variant="success"
                  onClick={() => handleStatusChange(selectedApplication.id, 'accepted')}
                >
                  Accept Application
                </Button>
              </div>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Container>
  );
}

export default CompanyApplications;