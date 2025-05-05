import React, { useState, useEffect } from "react";
import Profile from "../components/Profile";
import ApplicationReviewModal from "../components/ApplicationReviewModal";
import { Card, Badge, Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

function FacultyAcademicDashboardPage() {
  const [facultyData, setFacultyData] = useState(null);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [activeInternships, setActiveInternships] = useState([]);
  const [reviewedApplications, setReviewedApplications] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const navigate = useNavigate();
  
  // Load faculty data from localStorage
  useEffect(() => {
    // Get user data
    const userData = localStorage.getItem('currentUser');
    
    if (userData) {
      setFacultyData(JSON.parse(userData));
    } else {
      // Redirect to login if no user data is found
      navigate('/');
    }
    
    // Mock data for pending applications
    const mockPendingApplications = [
      { id: 1, studentName: "Ahmed Mohamed", major: "Computer Science", gpa: 3.7, internshipTitle: "Software Developer Intern" },
      { id: 2, studentName: "Sara Ali", major: "Business Informatics", gpa: 3.5, internshipTitle: "Data Analyst Intern" }
    ];
    
    // Load reviewed applications from localStorage or use empty array
    const storedReviewedApplications = JSON.parse(localStorage.getItem('reviewedApplications') || '[]');
    setReviewedApplications(storedReviewedApplications);
    
    // Filter out applications that have already been reviewed
    const filteredPendingApplications = mockPendingApplications.filter(app => 
      !storedReviewedApplications.some(reviewedApp => reviewedApp.id === app.id)
    );
    setPendingApplications(filteredPendingApplications);
    
    // Mock data for active internships (accepted applications)
    const acceptedApplications = storedReviewedApplications.filter(app => app.status === 'accepted');
    const mockActiveInternships = [
      ...acceptedApplications.map(app => ({
        id: app.id,
        studentName: app.studentName,
        major: app.major || "Computer Engineering",
        companyName: "Tech Innovators",
        position: app.internshipTitle || "Software Developer",
        startDate: "2023-06-01",
        endDate: "2023-08-31"
      })),
      { id: 3, studentName: "Omar Hassan", major: "Computer Engineering", companyName: "Tech Innovators", position: "Frontend Developer", startDate: "2023-06-01", endDate: "2023-08-31" }
    ];
    setActiveInternships(mockActiveInternships);
    
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
      
      // If application was accepted, add to active internships
      if (updatedApplication.status === 'accepted') {
        const newInternship = {
          id: updatedApplication.id,
          studentName: updatedApplication.studentName,
          major: updatedApplication.major,
          companyName: "Tech Innovators", // Example company
          position: updatedApplication.internshipTitle,
          startDate: "2023-06-01", // Example date
          endDate: "2023-08-31"    // Example date
        };
        
        setActiveInternships([...activeInternships, newInternship]);
      }
    }
  };
  
  if (!facultyData) {
    return <div>Loading profile...</div>;
  }
  
  // Get counts of applications by status
  const getStatusCounts = () => {
    const flagged = reviewedApplications.filter(app => app.status === 'flagged').length;
    const rejected = reviewedApplications.filter(app => app.status === 'rejected').length;
    const accepted = reviewedApplications.filter(app => app.status === 'accepted').length;
    const pending = pendingApplications.length;
    return { flagged, rejected, accepted, pending };
  };
  
  const statusCounts = getStatusCounts();
  
  return (
    <div>
      <Profile name={facultyData?.name || "Faculty Member"} navigateTo="/faculty/edit-profile" showEditButton={true} />
      
      {/* Dashboard Welcome Card */}
      <Container style={{ marginTop: '-50px', maxWidth: '1200px' }}>
        <Card className="mb-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', border: 'none' }}>
          <Card.Header style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
            <h4 style={{ margin: 0 }}>Faculty Academic Dashboard</h4>
          </Card.Header>
          <Card.Body>
            <Card.Title>Welcome, {facultyData?.name || "Faculty Member"}!</Card.Title>
            <Card.Text>
              From this dashboard, you can manage internship applications, review student submissions,
              and monitor the progress of students in your department.
            </Card.Text>
            
            {/* Application Status Summary */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '20px' }}>
              <Card style={{ width: '140px', textAlign: 'center' }}>
                <Card.Body className="p-2">
                  <h2>{statusCounts.pending}</h2>
                  <small>Pending</small>
                </Card.Body>
              </Card>
              <Card style={{ width: '140px', textAlign: 'center', backgroundColor: '#d4edda' }}>
                <Card.Body className="p-2">
                  <h2>{statusCounts.accepted}</h2>
                  <small>Accepted</small>
                </Card.Body>
              </Card>
              <Card style={{ width: '140px', textAlign: 'center', backgroundColor: '#f8d7da' }}>
                <Card.Body className="p-2">
                  <h2>{statusCounts.rejected}</h2>
                  <small>Rejected</small>
                </Card.Body>
              </Card>
              <Card style={{ width: '140px', textAlign: 'center', backgroundColor: '#fff3cd' }}>
                <Card.Body className="p-2">
                  <h2>{statusCounts.flagged}</h2>
                  <small>Flagged</small>
                </Card.Body>
              </Card>
            </div>
          </Card.Body>
        </Card>
        
        {/* Pending Applications Section */}
        <h3 style={{ marginBottom: '1.5rem', borderBottom: '2px solid #e9ecef', paddingBottom: '0.5rem' }}>
          Pending Applications
        </h3>
        
        <Row className="mb-4">
          {pendingApplications.length > 0 ? (
            pendingApplications.map((application) => (
              <Col md={6} className="mb-3" key={application.id}>
                <Card style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', border: 'none', height: '100%' }}>
                  <Card.Header style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h5 style={{ margin: 0 }}>{application.studentName}</h5>
                      <Badge bg="warning">Pending Review</Badge>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <p><strong>Major:</strong> {application.major}</p>
                    <p><strong>GPA:</strong> {application.gpa}</p>
                    <p><strong>Position:</strong> {application.internshipTitle}</p>
                  </Card.Body>
                  <Card.Footer style={{ backgroundColor: 'white', borderTop: '1px solid #e9ecef' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
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
                <Card.Body className="text-center">
                  <p>No pending applications to review.</p>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
        
        {/* Reviewed Applications Section */}
        {reviewedApplications.length > 0 && (
          <>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '2px solid #e9ecef', paddingBottom: '0.5rem' }}>
              Reviewed Applications
            </h3>
            <Row className="mb-4">
              {reviewedApplications
                .filter(app => app.status !== 'accepted') // Don't show accepted ones here since they're in Active Internships
                .map((application) => (
                <Col md={6} className="mb-3" key={application.id}>
                  <Card style={{ 
                    borderRadius: '10px', 
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
                    border: 'none', 
                    height: '100%',
                    borderLeft: application.status === 'rejected' 
                      ? '5px solid #dc3545' 
                      : application.status === 'flagged' 
                        ? '5px solid #ffc107' 
                        : 'none'
                  }}>
                    <Card.Header style={{ 
                      backgroundColor: application.status === 'rejected' 
                        ? '#f8d7da' 
                        : application.status === 'flagged' 
                          ? '#fff3cd' 
                          : '#f8f9fa', 
                      borderBottom: '1px solid #e9ecef' 
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h5 style={{ margin: 0 }}>{application.studentName}</h5>
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
                      <p><strong>Position:</strong> {application.internshipTitle}</p>
                      <p><strong>Review Date:</strong> {new Date(application.reviewDate).toLocaleDateString()}</p>
                      <div>
                        <strong>Comments:</strong>
                        <p style={{ 
                          padding: '10px', 
                          backgroundColor: '#f8f9fa', 
                          borderRadius: '5px',
                          marginTop: '5px' 
                        }}>
                          {application.comment || 'No comments provided.'}
                        </p>
                      </div>
                    </Card.Body>
                    <Card.Footer style={{ backgroundColor: 'white', borderTop: '1px solid #e9ecef' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
              ))}
            </Row>
          </>
        )}
        
        {/* Active Internships Section */}
        <h3 style={{ marginBottom: '1.5rem', borderBottom: '2px solid #e9ecef', paddingBottom: '0.5rem' }}>
          Active Internships
        </h3>
        
        <Row>
          {activeInternships.length > 0 ? (
            activeInternships.map((internship) => (
              <Col md={6} className="mb-3" key={internship.id}>
                <Card style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', border: 'none', height: '100%' }}>
                  <Card.Header style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h5 style={{ margin: 0 }}>{internship.studentName}</h5>
                      <Badge bg="success">Active</Badge>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <p><strong>Company:</strong> {internship.companyName}</p>
                    <p><strong>Position:</strong> {internship.position || internship.internshipTitle}</p>
                    {internship.supervisor && (
                      <p><strong>Supervisor:</strong> {internship.supervisor}</p>
                    )}
                    <p><strong>Duration:</strong> {new Date(internship.startDate).toLocaleDateString()} - {new Date(internship.endDate).toLocaleDateString()}</p>
                  </Card.Body>
                  <Card.Footer style={{ backgroundColor: 'white', borderTop: '1px solid #e9ecef' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Button variant="outline-primary" size="sm">View Progress</Button>
                      <Button variant="outline-info" size="sm">Contact Student</Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))
          ) : (
            <Col>
              <Card style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', border: 'none' }}>
                <Card.Body className="text-center">
                  <p>No students are currently engaged in active internships.</p>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      </Container>
      
      {/* Application Review Modal */}
      <ApplicationReviewModal 
        show={showReviewModal}
        onHide={handleModalClose}
        application={selectedApplication}
      />
    </div>
  );
}

export default FacultyAcademicDashboardPage;