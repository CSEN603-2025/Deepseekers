import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Row, Col, Modal, Table, Tabs, Tab, Form, Alert, Dropdown } from 'react-bootstrap';
import ApplicationForm from './ApplicationForm';
import '../css/Post.css';

function Post({ internship, isStudent = true, isScad = false }) {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationDetailsModal, setShowApplicationDetailsModal] = useState(false);
  
  // State for filtering applications by internship
  const [allCompanyApplications, setAllCompanyApplications] = useState([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState('');
  const [companyInternships, setCompanyInternships] = useState([]);
  
  // New state to track access permission
  const [hasPermission, setHasPermission] = useState(true);
  
  // Get current user
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const userType = currentUser?.type || '';

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Load all internships for the company when filtering is needed
  useEffect(() => {
    if (!isStudent && !isScad && showApplicationsModal) {
      const allInternships = JSON.parse(localStorage.getItem('postedInternships')) || [];
      // Filter only internships created by this company
      const companyId = currentUser?.id;
      const companyName = currentUser?.name;
      
      const filteredInternships = allInternships.filter(
        internship => internship.companyId === companyId || internship.companyName === companyName
      );
      
      setCompanyInternships(filteredInternships);
      
      // Load all applications for this company
      const allApplications = JSON.parse(localStorage.getItem('appliedInternships')) || [];
      const companyApplications = allApplications.filter(application => {
        const internship = allInternships.find(i => i.id === application.internshipId);
        return internship && (internship.companyId === companyId || internship.companyName === companyName);
      });
      
      setAllCompanyApplications(companyApplications);
      
      // Default to current internship
      setSelectedInternshipId(internship.id);
      const internshipApplications = companyApplications.filter(
        application => application.internshipId === internship.id
      );
      setApplications(internshipApplications);
    }
  }, [showApplicationsModal, isStudent, isScad, currentUser, internship]);

  const handleApplyClick = () => {
    setShowApplicationForm(true);
  };

  const handleApplicationFormClose = () => {
    setShowApplicationForm(false);
  };
  
  // Handle View Applications button click
  const handleViewApplicationsClick = () => {
    // Check if this company owns the internship
    if (!isStudent && !isScad) {
      const companyId = currentUser?.id;
      const companyName = currentUser?.name;
      
      // Check if this company owns the internship
      if (internship.companyId !== companyId && internship.companyName !== companyName) {
        setHasPermission(false);
        setShowApplicationsModal(true);
        return;
      } else {
        setHasPermission(true);
      }
    }
    
    // For SCAD or direct viewing without filtering by position
    if (isScad || selectedInternshipId) {
      // Load applications for this specific internship
      const allApplications = JSON.parse(localStorage.getItem('appliedInternships')) || [];
      const internshipApplications = allApplications.filter(
        application => application.internshipId === internship.id
      );
      
      setApplications(internshipApplications);
    }
    
    setShowApplicationsModal(true);
  };
  
  // Handle internship filter change
  const handleInternshipFilterChange = (e) => {
    const internshipId = e.target.value;
    setSelectedInternshipId(internshipId);
    
    if (internshipId === 'all') {
      // Show all applications for this company
      setApplications(allCompanyApplications);
    } else {
      // Filter applications for the selected internship
      const filteredApplications = allCompanyApplications.filter(
        application => application.internshipId === internshipId
      );
      setApplications(filteredApplications);
    }
  };
  
  // View application details
  const handleViewApplicationDetails = (application) => {
    setSelectedApplication(application);
    setShowApplicationDetailsModal(true);
  };
  
  // Update application status
  const handleUpdateStatus = (applicationId, newStatus) => {
    if (isScad) return; // SCAD users cannot change application status
    
    // Update status in local applications array
    const updatedApplications = applications.map(app => {
      if (app.id === applicationId) {
        return { ...app, status: newStatus };
      }
      return app;
    });
    
    setApplications(updatedApplications);
    
    // Also update in allCompanyApplications if it exists
    if (allCompanyApplications.length > 0) {
      const updatedAllApplications = allCompanyApplications.map(app => {
        if (app.id === applicationId) {
          return { ...app, status: newStatus };
        }
        return app;
      });
      setAllCompanyApplications(updatedAllApplications);
    }
    
    // Update status in localStorage
    const allApplications = JSON.parse(localStorage.getItem('appliedInternships')) || [];
    const updatedAllApplications = allApplications.map(app => {
      if (app.id === applicationId) {
        return { ...app, status: newStatus };
      }
      return app;
    });
    
    localStorage.setItem('appliedInternships', JSON.stringify(updatedAllApplications));
    
    // If we're updating the currently selected application, update that too
    if (selectedApplication && selectedApplication.id === applicationId) {
      setSelectedApplication({ ...selectedApplication, status: newStatus });
    }
  };

  // Check if the current user has already applied for this internship
  const hasApplied = () => {
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
            <Button 
              className="action-button view-button"
              onClick={handleViewApplicationsClick}
            >
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
      
      {/* Applications List Modal */}
      <Modal 
        show={showApplicationsModal} 
        onHide={() => setShowApplicationsModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {isScad ? 
              `Applications for ${internship.title}` : 
              'Internship Applications'
            }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Permission denied message */}
          {!hasPermission && (
            <Alert variant="danger" className="mb-0">
              <Alert.Heading>Access Denied</Alert.Heading>
              <p>
                You don't have permission to view applications for this internship position.
                You can only view applications for internships posted by your company.
              </p>
            </Alert>
          )}
          
          {/* Only show content if user has permission */}
          {hasPermission && (
            <>
              {/* Company-only filter by internship position */}
              {!isStudent && !isScad && companyInternships.length > 1 && (
                <Form.Group className="mb-4">
                  <Form.Label><strong>Filter by Internship Position</strong></Form.Label>
                  <Form.Select 
                    value={selectedInternshipId}
                    onChange={handleInternshipFilterChange}
                  >
                    <option value="all">All Positions</option>
                    {companyInternships.map(intern => (
                      <option key={intern.id} value={intern.id}>
                        {intern.title}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
              
              {applications.length > 0 ? (
                <Tabs defaultActiveKey="all" className="mb-3">
                  <Tab eventKey="all" title="All Applications">
                    <ApplicationsTable 
                      applications={applications} 
                      onViewDetails={handleViewApplicationDetails}
                      onUpdateStatus={handleUpdateStatus}
                      isScad={isScad}
                      internships={companyInternships}
                    />
                  </Tab>
                  <Tab eventKey="pending" title="Pending">
                    <ApplicationsTable 
                      applications={applications.filter(app => app.status === 'pending')} 
                      onViewDetails={handleViewApplicationDetails}
                      onUpdateStatus={handleUpdateStatus}
                      isScad={isScad}
                      internships={companyInternships}
                    />
                  </Tab>
                  <Tab eventKey="finalized" title="Finalized">
                    <ApplicationsTable 
                      applications={applications.filter(app => app.status === 'finalized')} 
                      onViewDetails={handleViewApplicationDetails}
                      onUpdateStatus={handleUpdateStatus}
                      isScad={isScad}
                      internships={companyInternships}
                    />
                  </Tab>
                  <Tab eventKey="accepted" title="Accepted">
                    <ApplicationsTable 
                      applications={applications.filter(app => app.status === 'accepted')} 
                      onViewDetails={handleViewApplicationDetails}
                      onUpdateStatus={handleUpdateStatus}
                      isScad={isScad}
                      internships={companyInternships}
                    />
                  </Tab>
                  <Tab eventKey="rejected" title="Rejected">
                    <ApplicationsTable 
                      applications={applications.filter(app => app.status === 'rejected')} 
                      onViewDetails={handleViewApplicationDetails}
                      onUpdateStatus={handleUpdateStatus}
                      isScad={isScad}
                      internships={companyInternships}
                    />
                  </Tab>
                </Tabs>
              ) : (
                <div className="text-center py-5">
                  <h5>No applications yet</h5>
                  <p className="text-muted">
                    There are currently no applications for this internship position.
                  </p>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        {!hasPermission && (
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowApplicationsModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        )}
      </Modal>
      
      {/* Application Details Modal */}
      <Modal 
        show={showApplicationDetailsModal} 
        onHide={() => setShowApplicationDetailsModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Application Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApplication && (
            <div className="application-details">
              <div className="application-header mb-4">
                <h5>{selectedApplication.studentName}</h5>
                <p className="text-muted">{selectedApplication.studentEmail}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="submission-date">
                    Submitted on {formatDate(selectedApplication.applicationDate)}
                  </span>
                  
                  {/* Show position title if filtering is enabled */}
                  {!isScad && selectedInternshipId === 'all' && (
                    <span className="position-title">
                      {companyInternships.find(intern => intern.id === selectedApplication.internshipId)?.title || 'Unknown Position'}
                    </span>
                  )}
                  
                  <ApplicationStatusBadge status={selectedApplication.status} />
                </div>
              </div>
              
              <div className="application-section mb-4">
                <h6 className="section-title">Cover Letter</h6>
                <div className="section-content">
                  {selectedApplication.coverLetter}
                </div>
              </div>
              
              <div className="application-section mb-4">
                <h6 className="section-title">Why Interested</h6>
                <div className="section-content">
                  {selectedApplication.whyApplying}
                </div>
              </div>
              
              <div className="application-section mb-4">
                <h6 className="section-title">Relevant Experience & Skills</h6>
                <div className="section-content">
                  {selectedApplication.relevantExperience}
                </div>
              </div>
              
              <div className="application-section mb-4">
                <h6 className="section-title">Attached Documents</h6>
                <div className="section-content">
                  <ul className="list-unstyled">
                    {selectedApplication.resumeBase64 && (
                      <li>
                        <Button 
                          variant="outline-primary"
                          size="sm"
                          className="document-link"
                          onClick={() => {
                            // Open PDF in new tab
                            const pdfWindow = window.open();
                            pdfWindow.document.write(`
                              <html>
                                <head>
                                  <title>Resume - ${selectedApplication.studentName}</title>
                                  <style>
                                    body, html {
                                      margin: 0;
                                      padding: 0;
                                      height: 100%;
                                      overflow: hidden;
                                    }
                                    embed {
                                      width: 100%;
                                      height: 100%;
                                    }
                                  </style>
                                </head>
                                <body>
                                  <embed src="${selectedApplication.resumeBase64}" type="application/pdf" width="100%" height="100%" />
                                </body>
                              </html>
                            `);
                          }}
                        >
                          <i className="bi bi-file-earmark-pdf me-2"></i>
                          View Resume/CV
                        </Button>
                      </li>
                    )}
                    {selectedApplication.certificateBase64 && (
                      <li>
                        <Button 
                          variant="outline-primary"
                          size="sm"
                          className="document-link"
                          onClick={() => {
                            // Open PDF in new tab
                            const pdfWindow = window.open();
                            pdfWindow.document.write(`
                              <html>
                                <head>
                                  <title>Certificate - ${selectedApplication.studentName}</title>
                                  <style>
                                    body, html {
                                      margin: 0;
                                      padding: 0;
                                      height: 100%;
                                      overflow: hidden;
                                    }
                                    embed {
                                      width: 100%;
                                      height: 100%;
                                    }
                                  </style>
                                </head>
                                <body>
                                  <embed src="${selectedApplication.certificateBase64}" type="application/pdf" width="100%" height="100%" />
                                </body>
                              </html>
                            `);
                          }}
                        >
                          <i className="bi bi-file-earmark-pdf me-2"></i>
                          View Certificate
                        </Button>
                      </li>
                    )}
                    {selectedApplication.otherDocBase64 && (
                      <li>
                        <Button 
                          variant="outline-primary"
                          size="sm"
                          className="document-link"
                          onClick={() => {
                            // Open PDF in new tab
                            const pdfWindow = window.open();
                            pdfWindow.document.write(`
                              <html>
                                <head>
                                  <title>Document - ${selectedApplication.studentName}</title>
                                  <style>
                                    body, html {
                                      margin: 0;
                                      padding: 0;
                                      height: 100%;
                                      overflow: hidden;
                                    }
                                    embed {
                                      width: 100%;
                                      height: 100%;
                                    }
                                  </style>
                                </head>
                                <body>
                                  <embed src="${selectedApplication.otherDocBase64}" type="application/pdf" width="100%" height="100%" />
                                </body>
                              </html>
                            `);
                          }}
                        >
                          <i className="bi bi-file-earmark-pdf me-2"></i>
                          View Other Document
                        </Button>
                      </li>
                    )}
                    {!selectedApplication.resumeBase64 && 
                     !selectedApplication.certificateBase64 && 
                     !selectedApplication.otherDocBase64 && (
                      <li className="text-muted">No documents attached</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-between w-100">
            <div>
              <Button 
                variant="secondary" 
                onClick={() => setShowApplicationDetailsModal(false)}
              >
                Close
              </Button>
            </div>
            
            {/* Only show status buttons for company users */}
            {selectedApplication && !isScad && (
              <div>
                <Button 
                  variant="info" 
                  className="me-2"
                  onClick={() => handleUpdateStatus(selectedApplication.id, 'finalized')}
                  disabled={selectedApplication.status === 'finalized'}
                >
                  Mark as Finalized
                </Button>
                <Button 
                  variant="danger" 
                  className="me-2"
                  onClick={() => handleUpdateStatus(selectedApplication.id, 'rejected')}
                  disabled={selectedApplication.status === 'rejected'}
                >
                  Reject
                </Button>
                <Button 
                  variant="success"
                  onClick={() => handleUpdateStatus(selectedApplication.id, 'accepted')}
                  disabled={selectedApplication.status === 'accepted'}
                >
                  Accept
                </Button>
              </div>
            )}
          </div>
        </Modal.Footer>
      </Modal>
    </Card>
  );
}

// Helper component for displaying applications in a table
function ApplicationsTable({ applications, onViewDetails, onUpdateStatus, isScad = false, internships = [] }) {
  // Get internship title for display
  const getInternshipTitle = (internshipId) => {
    if (!internships || internships.length === 0) return '';
    const internship = internships.find(i => i.id === internshipId);
    return internship ? internship.title : 'Unknown Position';
  };

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Student Name</th>
          <th>Email</th>
          {internships.length > 0 && <th>Position</th>}
          <th>Date Applied</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {applications.map(application => (
          <tr key={application.id}>
            <td>{application.studentName}</td>
            <td>{application.studentEmail}</td>
            {internships.length > 0 && <td>{getInternshipTitle(application.internshipId)}</td>}
            <td>{new Date(application.applicationDate).toLocaleDateString()}</td>
            <td><ApplicationStatusBadge status={application.status} /></td>
            <td>
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={() => onViewDetails(application)}
                className={isScad ? "" : "me-2"}
              >
                View Details
              </Button>
              
              {/* Only show status dropdown for company users */}
              {!isScad && (
                <StatusDropdown
                  currentStatus={application.status}
                  applicationId={application.id}
                  onUpdateStatus={onUpdateStatus}
                />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

// Helper component for displaying application status badge
function ApplicationStatusBadge({ status }) {
  let variant;
  let label = status;
  
  switch(status) {
    case 'pending':
      variant = 'warning';
      break;
    case 'finalized':  // New status
      variant = 'info';
      break;
    case 'accepted':
      variant = 'success';
      break;
    case 'rejected':
      variant = 'danger';
      break;
    default:
      variant = 'secondary';
  }
  
  return <Badge bg={variant}>{label}</Badge>;
}

// Helper component for status dropdown
function StatusDropdown({ currentStatus, applicationId, onUpdateStatus }) {
  return (
    <div className="d-inline-block">
      <Dropdown>
        <Dropdown.Toggle variant="outline-secondary" size="sm">
          Change Status
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item 
            onClick={() => onUpdateStatus(applicationId, 'pending')}
            disabled={currentStatus === 'pending'}
          >
            Pending
          </Dropdown.Item>
          <Dropdown.Item 
            className="text-info"
            onClick={() => onUpdateStatus(applicationId, 'finalized')}
            disabled={currentStatus === 'finalized'}
          >
            Finalized
          </Dropdown.Item>
          <Dropdown.Item 
            className="text-success"
            onClick={() => onUpdateStatus(applicationId, 'accepted')}
            disabled={currentStatus === 'accepted'}
          >
            Accept
          </Dropdown.Item>
          <Dropdown.Item 
            className="text-danger"
            onClick={() => onUpdateStatus(applicationId, 'rejected')}
            disabled={currentStatus === 'rejected'}
          >
            Reject
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}

export default Post;