import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import InternshipDetailsForm from '../components/InternshipDetailsForm';

function StudentInternshipDetailsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [application, setApplication] = useState(null);
  const [existingDetails, setExistingDetails] = useState(null);
  const [error, setError] = useState('');
  const { applicationId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    } else {
      navigate('/');
      return;
    }

    // Check if user is a student
    const user = JSON.parse(userData);
    if (user.role !== 'student') {
      setError('Only students can access this page');
      return;
    }

    // Get application by ID
    const reviewedApplications = JSON.parse(localStorage.getItem('reviewedApplications') || '[]');
    const app = reviewedApplications.find(a => a.id.toString() === applicationId);
    
    if (!app) {
      setError('Application not found or not approved yet');
      return;
    }

    if (app.status !== 'accepted') {
      setError('You can only provide details for accepted applications');
      return;
    }

    setApplication(app);

    // Check if details already exist
    const internshipDetails = JSON.parse(localStorage.getItem('internshipDetails') || '[]');
    const details = internshipDetails.find(d => d.applicationId.toString() === applicationId);
    
    if (details) {
      setExistingDetails(details);
    }
  }, [applicationId, navigate]);

  const handleDetailsSubmitted = (details) => {
    setExistingDetails(details);
    
    // In a real app, we would also update the application status in the database
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  };

  if (error) {
    return (
      <>
        <NavigationBar />
        <Container className="mt-5">
          <Alert variant="danger">{error}</Alert>
          <Button 
            variant="primary" 
            onClick={() => navigate('/student/home')}
            className="mt-3"
          >
            Return to Dashboard
          </Button>
        </Container>
      </>
    );
  }

  if (!application) {
    return (
      <>
        <NavigationBar />
        <Container className="mt-5">
          <Card>
            <Card.Body className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading application details...</p>
            </Card.Body>
          </Card>
        </Container>
      </>
    );
  }

  return (
    <>
      <NavigationBar />
      <Container className="mt-4 mb-5">
        <h2 className="mb-4">Internship Details Submission</h2>
        
        {existingDetails && (
          <Alert variant="success" className="mb-4">
            <Alert.Heading>Details Submitted</Alert.Heading>
            <p>
              You have already submitted details for this internship. You can update them using the form below if needed.
            </p>
            <hr />
            <p className="mb-0">
              <strong>Submitted on:</strong> {new Date(existingDetails.submittedDate).toLocaleString()}
            </p>
          </Alert>
        )}
        
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Application Information</h5>
          </Card.Header>
          <Card.Body>
            <p><strong>Position:</strong> {application.internshipTitle}</p>
            <p><strong>Application Status:</strong> Accepted</p>
            <p><strong>Approved Date:</strong> {new Date(application.reviewDate).toLocaleDateString()}</p>
            {application.comment && (
              <>
                <p><strong>Faculty Comments:</strong></p>
                <p className="mb-0 p-2 bg-light rounded">{application.comment}</p>
              </>
            )}
          </Card.Body>
        </Card>
        
        <InternshipDetailsForm 
          applicationId={application.id}
          onDetailsSubmitted={handleDetailsSubmitted}
        />
        
        <div className="d-flex justify-content-between mt-4">
          <Button variant="outline-secondary" onClick={() => navigate('/student/home')}>
            Back to Dashboard
          </Button>
        </div>
      </Container>
    </>
  );
}

export default StudentInternshipDetailsPage; 