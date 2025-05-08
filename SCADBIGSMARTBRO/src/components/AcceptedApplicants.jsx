import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Form } from 'react-bootstrap';
import '../css/AcceptedApplicants.css';

    const AcceptedApplicants = ({ searchTerm, statusFilter }) => {
  const [acceptedApplicants, setAcceptedApplicants] = useState([]);
  const [internships, setInternships] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [filteredApplicants, setFilteredApplicants] = useState([]);

  // Get current company user
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const companyId = currentUser?.id;
  const companyName = currentUser?.name;

  useEffect(() => {
    loadAcceptedApplicants();
  }, []);

  // Apply filters when searchTerm or statusFilter changes
  useEffect(() => {
    if (acceptedApplicants.length > 0) {
      let filtered = [...acceptedApplicants];
      
      // Apply search filter if provided
      if (searchTerm && searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase().trim();
        filtered = filtered.filter(applicant => {
          // Get internship title for comparison
          const internship = internships.find(i => i.id === applicant.internshipId);
          const internshipTitle = internship ? internship.title.toLowerCase() : '';
          
          return (
            applicant.studentName.toLowerCase().includes(term) || 
            internshipTitle.includes(term)
          );
        });
      }
      
      // Apply status filter if provided and not 'all'
      if (statusFilter && statusFilter !== 'all') {
        filtered = filtered.filter(applicant => applicant.status === statusFilter);
      }
      
      setFilteredApplicants(filtered);
    } else {
      setFilteredApplicants([]);
    }
  }, [searchTerm, statusFilter, acceptedApplicants, internships]);

  const loadAcceptedApplicants = () => {
    // Get all internships
    const allInternships = JSON.parse(localStorage.getItem('postedInternships')) || [];
    
    // Filter internships that belong to this company
    const companyInternships = allInternships.filter(
      internship => internship.companyId === companyId || internship.companyName === companyName
    );
    
    setInternships(companyInternships);
    
    // Get all applications
    const allApplications = JSON.parse(localStorage.getItem('appliedInternships')) || [];
    
    // Filter applications with "accepted" status for this company's internships
    const acceptedApplications = allApplications.filter(application => {
      const correspondingInternship = companyInternships.find(
        internship => internship.id === application.internshipId
      );
      
      return correspondingInternship && (application.status === 'accepted' || 
             application.status === 'current_intern' || 
             application.status === 'internship_complete');
    });
    
    setAcceptedApplicants(acceptedApplications);
    setFilteredApplicants(acceptedApplications); // Initialize filtered list with all accepted applicants
  };

  const handleViewDetails = (applicant) => {
    setSelectedApplicant(applicant);
    setShowDetailsModal(true);
  };

  const handleStatusChange = (applicant, newStatus) => {
    // Update the status in localStorage
    const allApplications = JSON.parse(localStorage.getItem('appliedInternships')) || [];
    const updatedApplications = allApplications.map(app => {
      if (app.id === applicant.id) {
        // Update status and add timestamps
        const updatedApp = { ...app, status: newStatus };
        
        if (newStatus === 'current_intern') {
          updatedApp.internshipStartDate = new Date().toISOString();
        } else if (newStatus === 'internship_complete') {
          updatedApp.internshipEndDate = new Date().toISOString();
        }
        
        return updatedApp;
      }
      return app;
    });
    
    // Save back to localStorage
    localStorage.setItem('appliedInternships', JSON.stringify(updatedApplications));
    
    // Update the state
    const updatedApplicants = acceptedApplicants.map(app => 
      app.id === applicant.id ? {
        ...app, 
        status: newStatus,
        ...(newStatus === 'current_intern' ? { internshipStartDate: new Date().toISOString() } : {}),
        ...(newStatus === 'internship_complete' ? { internshipEndDate: new Date().toISOString() } : {})
      } : app
    );
    
    setAcceptedApplicants(updatedApplicants);
    
    // If we were showing details modal, update the selected applicant
    if (selectedApplicant && selectedApplicant.id === applicant.id) {
      setSelectedApplicant({
        ...selectedApplicant,
        status: newStatus,
        ...(newStatus === 'current_intern' ? { internshipStartDate: new Date().toISOString() } : {}),
        ...(newStatus === 'internship_complete' ? { internshipEndDate: new Date().toISOString() } : {})
      });
    }
  };

  const handleOpenFeedbackModal = (applicant) => {
    setSelectedApplicant(applicant);
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = () => {
    // Update the applicant record with feedback and rating
    const allApplications = JSON.parse(localStorage.getItem('appliedInternships')) || [];
    const updatedApplications = allApplications.map(app => {
      if (app.id === selectedApplicant.id) {
        return { 
          ...app, 
          feedback,
          rating,
          feedbackDate: new Date().toISOString()
        };
      }
      return app;
    });
    
    // Save back to localStorage
    localStorage.setItem('appliedInternships', JSON.stringify(updatedApplications));
    
    // Update the state
    const updatedApplicants = acceptedApplicants.map(app => 
      app.id === selectedApplicant.id ? {
        ...app,
        feedback,
        rating,
        feedbackDate: new Date().toISOString()
      } : app
    );
    
    setAcceptedApplicants(updatedApplicants);
    
    // Update selected applicant if we keep the modal open
    setSelectedApplicant({
      ...selectedApplicant,
      feedback,
      rating,
      feedbackDate: new Date().toISOString()
    });
    
    // Close the modal
    setShowFeedbackModal(false);
    setFeedback('');
    setRating(5);
  };

  // Display status badge with appropriate color
  const getStatusBadge = (status) => {
    let variant, label;
    switch(status) {
      case 'accepted':
        variant = 'success';
        label = 'Accepted';
        break;
      case 'current_intern':
        variant = 'primary';
        label = 'Current Intern';
        break;
      case 'internship_complete':
        variant = 'secondary';
        label = 'Internship Complete';
        break;
      default:
        variant = 'secondary';
        label = status;
    }
    return <Badge bg={variant}>{label}</Badge>;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Find internship title based on internship ID
  const getInternshipTitle = (internshipId) => {
    const internship = internships.find(i => i.id === internshipId);
    return internship ? internship.title : 'Unknown Position';
  };

  // View document in a new tab
  const viewDocument = (documentBase64, documentName) => {
    if (documentBase64) {
      const newWindow = window.open();
      newWindow.document.write(`
        <html>
          <head>
            <title>${documentName || 'Document'}</title>
            <style>
              body, html { margin: 0; padding: 0; height: 100%; }
              embed { width: 100%; height: 100%; }
            </style>
          </head>
          <body>
            <embed src="${documentBase64}" type="application/pdf" width="100%" height="100%" />
          </body>
        </html>
      `);
    } else {
      alert("Document not available for viewing");
    }
  };

  return (
    <div className="accepted-applicants-container">
      <p className="text-muted mb-4">
        Manage applicants who have been accepted for internships. Update their status as they progress through their internship.
      </p>
      
      {filteredApplicants.length === 0 ? (
        <Card className="text-center p-4">
          <Card.Body>
            <h5>No Accepted Applicants Found</h5>
            <p className="text-muted">
              {acceptedApplicants.length === 0 
                ? "You haven't accepted any applicants for internships yet."
                : "No applicants match your search criteria. Try adjusting your filters."
              }
            </p>  
          </Card.Body>
        </Card>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Position</th>
              <th>Date Accepted</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplicants.map(applicant => (
              <tr key={applicant.id}>
                <td>{applicant.studentName}</td>
                <td>{getInternshipTitle(applicant.internshipId)}</td>
                <td>{formatDate(applicant.applicationDate)}</td>
                <td>{getStatusBadge(applicant.status)}</td>
                <td>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="me-2"
                    onClick={() => handleViewDetails(applicant)}
                  >
                    View Details
                  </Button>
                  
                  {applicant.status === 'accepted' && (
                    <Button 
                      variant="outline-success" 
                      size="sm"
                      className="me-2"
                      onClick={() => handleStatusChange(applicant, 'current_intern')}
                    >
                      Set as Current Intern
                    </Button>
                  )}
                  
                  {applicant.status === 'current_intern' && (
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => handleStatusChange(applicant, 'internship_complete')}
                    >
                      Mark as Complete
                    </Button>
                  )}
                  
                  {applicant.status === 'internship_complete' && !applicant.feedback && (
                    <Button 
                      variant="outline-info" 
                      size="sm"
                      onClick={() => handleOpenFeedbackModal(applicant)}
                    >
                      Add Feedback
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      
      {/* Applicant Details Modal */}
      <Modal 
        show={showDetailsModal} 
        onHide={() => setShowDetailsModal(false)} 
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Applicant Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApplicant && (
            <div className="applicant-details">
              <div className="applicant-header mb-4">
                <h5>{selectedApplicant.studentName}</h5>
                <p className="text-muted">{selectedApplicant.studentEmail}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span>
                    Applied for: <strong>{getInternshipTitle(selectedApplicant.internshipId)}</strong>
                  </span>
                  {getStatusBadge(selectedApplicant.status)}
                </div>
              </div>
              
              {selectedApplicant.status !== 'accepted' && (
                <div className="timeline-section mb-4">
                  <h6 className="section-title">Internship Timeline</h6>
                  <ul className="timeline">
                    <li>
                      <span className="timeline-badge bg-success"></span>
                      <div className="timeline-item">
                        <div className="timeline-title">Application Accepted</div>
                        <div className="timeline-date">{formatDate(selectedApplicant.applicationDate)}</div>
                      </div>
                    </li>
                    
                    {selectedApplicant.internshipStartDate && (
                      <li>
                        <span className="timeline-badge bg-primary"></span>
                        <div className="timeline-item">
                          <div className="timeline-title">Internship Started</div>
                          <div className="timeline-date">{formatDate(selectedApplicant.internshipStartDate)}</div>
                        </div>
                      </li>
                    )}
                    
                    {selectedApplicant.internshipEndDate && (
                      <li>
                        <span className="timeline-badge bg-secondary"></span>
                        <div className="timeline-item">
                          <div className="timeline-title">Internship Completed</div>
                          <div className="timeline-date">{formatDate(selectedApplicant.internshipEndDate)}</div>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              )}
              
              <div className="application-section mb-4">
                <h6 className="section-title">Cover Letter</h6>
                <div className="section-content">
                  {selectedApplicant.coverLetter}
                </div>
              </div>
              
              <div className="application-section mb-4">
                <h6 className="section-title">Why Interested</h6>
                <div className="section-content">
                  {selectedApplicant.whyApplying}
                </div>
              </div>
              
              <div className="application-section mb-4">
                <h6 className="section-title">Relevant Experience & Skills</h6>
                <div className="section-content">
                  {selectedApplicant.relevantExperience}
                </div>
              </div>
              
              <div className="application-section mb-4">
                <h6 className="section-title">Attached Documents</h6>
                <div className="document-section">
                  {selectedApplicant.resumeBase64 && (
                    <Button 
                      variant="outline-primary"
                      size="sm"
                      className="me-2 mb-2"
                      onClick={() => viewDocument(selectedApplicant.resumeBase64, 'Resume')}
                    >
                      <i className="bi bi-file-earmark-pdf me-2"></i>
                      View Resume/CV
                    </Button>
                  )}
                  
                  {selectedApplicant.certificateBase64 && (
                    <Button 
                      variant="outline-primary"
                      size="sm"
                      className="me-2 mb-2"
                      onClick={() => viewDocument(selectedApplicant.certificateBase64, 'Certificate')}
                    >
                      <i className="bi bi-file-earmark-pdf me-2"></i>
                      View Certificate
                    </Button>
                  )}
                  
                  {selectedApplicant.otherDocBase64 && (
                    <Button 
                      variant="outline-primary"
                      size="sm"
                      className="mb-2"
                      onClick={() => viewDocument(selectedApplicant.otherDocBase64, 'Other Document')}
                    >
                      <i className="bi bi-file-earmark-pdf me-2"></i>
                      View Other Document
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Feedback section (if available) */}
              {selectedApplicant.feedback && (
                <div className="feedback-section mb-4">
                  <h6 className="section-title">Company Feedback</h6>
                  <div className="section-content">
                    <div className="rating mb-2">
                      <strong>Rating:</strong> {selectedApplicant.rating}/5
                    </div>
                    <div className="feedback-text">
                      {selectedApplicant.feedback}
                    </div>
                    {selectedApplicant.feedbackDate && (
                      <div className="feedback-date text-muted mt-2">
                        Feedback provided on {formatDate(selectedApplicant.feedbackDate)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          
          {selectedApplicant && selectedApplicant.status === 'accepted' && (
            <Button 
              variant="success"
              onClick={() => {
                handleStatusChange(selectedApplicant, 'current_intern');
                setShowDetailsModal(false);
              }}
            >
              Set as Current Intern
            </Button>
          )}
          
          {selectedApplicant && selectedApplicant.status === 'current_intern' && (
            <Button 
              variant="primary"
              onClick={() => {
                handleStatusChange(selectedApplicant, 'internship_complete');
                setShowDetailsModal(false);
              }}
            >
              Mark as Complete
            </Button>
          )}
        </Modal.Footer>
      </Modal>
      
      {/* Feedback Modal */}
      <Modal
        show={showFeedbackModal}
        onHide={() => setShowFeedbackModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Provide Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApplicant && (
            <Form>
              <p>
                Providing feedback for <strong>{selectedApplicant.studentName}</strong> who completed 
                their internship as <strong>{getInternshipTitle(selectedApplicant.internshipId)}</strong>
              </p>
              
              <Form.Group className="mb-3">
                <Form.Label>Rating (1-5)</Form.Label>
                <Form.Select
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value))}
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Very Good</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Feedback</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Please provide detailed feedback about the intern's performance, skills, and areas for improvement..."
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFeedbackModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmitFeedback}
            disabled={!feedback.trim()}
          >
            Submit Feedback
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AcceptedApplicants;