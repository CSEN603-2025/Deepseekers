import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Modal, Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Profile from '../components/Profile';
import '../css/StudentProfilePage.css';

const majors = [
  { name: 'MET', semesters: 10 },
  { name: 'DMET', semesters: 10 },
  { name: 'IET', semesters: 10 },
  { name: 'Mechatronics', semesters: 10 },
  { name: 'BI', semesters: 8 },
  { name: 'Pharmacy', semesters: 10 },
  { name: 'Management', semesters: 8 },
  { name: 'Business', semesters: 8 },
  { name: 'Law', semesters: 8 }
];

function StudentProfilePage() {
    const [currentUser, setCurrentUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        jobInterests: '',
        internships: '',
        activities: '',
        major: '',
        semester: '',
    });
    const [semesterOptions, setSemesterOptions] = useState([]);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);
    const [sharedAssessments, setSharedAssessments] = useState([]);
    const navigate = useNavigate();
    
    useEffect(() => {
        // Retrieve user data from localStorage
        const userData = localStorage.getItem('currentUser');
        
        if (userData) {
            const parsedUserData = JSON.parse(userData);
            setCurrentUser(parsedUserData);
            
            // Load profile data from structured storage
            const allStudentProfiles = JSON.parse(localStorage.getItem('allStudentProfiles')) || {};
            const studentId = parsedUserData.id;
            
            if (allStudentProfiles[studentId]) {
                // Use profile from structured storage
                setProfile(allStudentProfiles[studentId]);
                
                // Generate semester options if major exists
                const majorObj = majors.find((m) => m.name === allStudentProfiles[studentId].major);
                if (majorObj) {
                    const semesters = [...Array(majorObj.semesters)].map((_, i) => i + 1);
                    setSemesterOptions(semesters);
                }
            } else {
                // Fallback to legacy storage if available
                const savedProfile = localStorage.getItem('studentProfile');
                if (savedProfile) {
                    const parsedProfile = JSON.parse(savedProfile);
                    setProfile(parsedProfile);
                    
                    // Generate semester options if major exists
                    const majorObj = majors.find((m) => m.name === parsedProfile.major);
                    if (majorObj) {
                        const semesters = [...Array(majorObj.semesters)].map((_, i) => i + 1);
                        setSemesterOptions(semesters);
                    }
                }
            }
            
            // Load shared assessment scores
            const completedAssessments = JSON.parse(localStorage.getItem('completedAssessments')) || [];
            const userSharedAssessments = completedAssessments.filter(
                assessment => assessment.studentId === parsedUserData.id && assessment.sharedOnProfile
            );
            setSharedAssessments(userSharedAssessments);
        } else {
            // Redirect to login if no user data is found
            navigate('/');
        }
    }, [navigate]);

    // Handle edit button click
    const handleEditClick = () => {
        setIsEditing(true);
    };

    // Handle profile form changes
    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    // Handle major selection
    const handleMajorChange = (e) => {
        const selectedMajor = e.target.value;
        setProfile({ ...profile, major: selectedMajor });

        // Find the selected major object
        const majorObj = majors.find((major) => major.name === selectedMajor);
        if (majorObj) {
            // Adjust the semester options based on the major
            const maxSemesters = majorObj.semesters;
            const semesters = [...Array(maxSemesters)].map((_, i) => i + 1);
            setSemesterOptions(semesters);
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Get all student profiles
        const allStudentProfiles = JSON.parse(localStorage.getItem('allStudentProfiles')) || {};
        
        // Update the profile for this specific student
        allStudentProfiles[currentUser.id] = {
            ...profile,
            id: currentUser.id  // Ensure ID is always present
        };
        
        // Save back to structured storage
        localStorage.setItem('allStudentProfiles', JSON.stringify(allStudentProfiles));
        
        // Keep the single studentProfile updated for backward compatibility
        localStorage.setItem('studentProfile', JSON.stringify(profile));
        
        setIsEditing(false);
        setShowSaveModal(true);
    };
    
    // Handle clearing profile
    const handleClear = () => {
        setShowClearModal(true);
    };
    
    // Confirm clear profile
    const confirmClear = () => {
        // Get all student profiles
        const allStudentProfiles = JSON.parse(localStorage.getItem('allStudentProfiles')) || {};
        
        // If this student has a profile, remove just the content fields but keep the ID and basic info
        if (allStudentProfiles[currentUser.id]) {
            allStudentProfiles[currentUser.id] = {
                id: currentUser.id,
                name: currentUser.name,
                email: currentUser.email,
                gucId: currentUser.gucId,
                faculty: currentUser.faculty,
                major: currentUser.major || '',
                jobInterests: '',
                internships: '',
                activities: '',
                semester: '',
            };
            
            // Save back to storage
            localStorage.setItem('allStudentProfiles', JSON.stringify(allStudentProfiles));
        }
        
        // Remove from legacy storage
        localStorage.removeItem('studentProfile');
        
        // Update the UI
        setProfile({
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            gucId: currentUser.gucId,
            faculty: currentUser.faculty,
            major: currentUser.major || '',
            jobInterests: '',
            internships: '',
            activities: '',
            semester: '',
        });
        
        setSemesterOptions([]);
        setShowClearModal(false);
    };

    // Add this helper function
    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (!currentUser) {
        return <div>Loading profile...</div>;
    }

    return (
        <div className="student-profile-page">   
            {/* Profile component */}
            <Profile 
                name={currentUser.name} 
                navigateTo="#" 
                showEditButton={!isEditing}
                profileType="student"
                userData={currentUser}
                onEditClick={handleEditClick}
                isPro={currentUser.pro}
            />
            
            {/* Profile details section */}
            <Container className="profile-details-section mt-4">
                <Row>
                    <Col md={12}>
                        <div className="profile-info-container">
                            <h3 className="section-title">
                                {isEditing ? "Edit Your Profile" : "Your Profile"}
                                {!isEditing && profile.jobInterests && (
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm" 
                                        className="ms-3"
                                        onClick={handleEditClick}
                                    >
                                        Edit Details
                                    </Button>
                                )}
                            </h3>
                            
                            {isEditing ? (
                                <Form className="profile-form" onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Job Interests:</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="jobInterests"
                                            value={profile.jobInterests}
                                            onChange={handleChange}
                                            placeholder="e.g. Frontend development, AI, networking..."
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Previous Internships / Part-time Jobs:</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="internships"
                                            value={profile.internships}
                                            onChange={handleChange}
                                            placeholder="Include responsibilities, duration, company name..."
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>College Activities:</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="activities"
                                            value={profile.activities}
                                            onChange={handleChange}
                                            placeholder="e.g. Member of robotics club, volunteered at events..."
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Major:</Form.Label>
                                        <Form.Select 
                                            name="major" 
                                            value={profile.major} 
                                            onChange={handleMajorChange}
                                        >
                                            <option value="">Select Major</option>
                                            {majors
                                                .sort((a, b) => a.name.localeCompare(b.name))
                                                .map((major) => (
                                                    <option key={major.name} value={major.name}>
                                                        {major.name}
                                                    </option>
                                                ))}
                                        </Form.Select>
                                    </Form.Group>

                                    {profile.major && (
                                        <Form.Group className="mb-3">
                                            <Form.Label>Semester Number:</Form.Label>
                                            <Form.Select 
                                                name="semester" 
                                                value={profile.semester} 
                                                onChange={handleChange}
                                            >
                                                <option value="">Select Semester</option>
                                                {semesterOptions.map((semester) => (
                                                    <option key={semester} value={semester}>
                                                        {semester}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    )}
                                    
                                    <div className="button-group mt-4">
                                        <Button 
                                            variant="outline-danger" 
                                            className="me-auto"
                                            onClick={handleClear}
                                            type="button"
                                        >
                                            Clear Profile
                                        </Button>
                                        <Button 
                                            variant="outline-secondary" 
                                            className="ms-2"
                                            onClick={() => setIsEditing(false)}
                                            type="button"
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            variant="primary" 
                                            className="ms-2"
                                            type="submit"
                                        >
                                            Save Profile
                                        </Button>
                                    </div>
                                </Form>
                            ) : (
                                profile.jobInterests ? (
                                    <div className="profile-info">
                                        <div className="info-section">
                                            <h5>Job Interests</h5>
                                            <p>{profile.jobInterests || "Not specified"}</p>
                                        </div>
                                        
                                        <div className="info-section">
                                            <h5>Previous Internships / Part-time Jobs</h5>
                                            <p>{profile.internships || "None"}</p>
                                        </div>
                                        
                                        <div className="info-section">
                                            <h5>College Activities</h5>
                                            <p>{profile.activities || "None"}</p>
                                        </div>
                                        
                                        <div className="info-section">
                                            <h5>Academic Information</h5>
                                            <p>
                                                <strong>Major:</strong> {profile.major || "Not specified"}<br />
                                                {profile.semester && (
                                                    <><strong>Semester:</strong> {profile.semester}</>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="no-profile-info text-center py-4">
                                        <p>You haven't added any profile details yet.</p>
                                        <Button variant="primary" onClick={handleEditClick}>
                                            Add Profile Details
                                        </Button>
                                    </div>
                                )
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>
            
            {/* Assessment Scores Section - Add this new section */}
            <Container className="assessment-scores-section mt-4">
                <Row>
                    <Col md={12}>
                        <div className="assessment-info-container">
                            <h3 className="section-title">Assessment Results</h3>
                            
                            {sharedAssessments.length > 0 ? (
                                <div className="assessment-cards">
                                    <Row>
                                        {sharedAssessments.map(assessment => (
                                            <Col key={assessment.id} md={4} className="mb-3">
                                                <Card className="assessment-card">
                                                    <Card.Body>
                                                        <Card.Title>{assessment.assessmentTitle}</Card.Title>
                                                        <div className="text-center my-3">
                                                            <div className={`score-circle mx-auto ${
                                                                assessment.score >= 70 ? 'high-score' : 
                                                                assessment.score >= 40 ? 'medium-score' : 'low-score'
                                                            }`}>
                                                                {assessment.score}%
                                                            </div>
                                                        </div>
                                                        <div className="assessment-meta">
                                                            <Badge 
                                                                bg={assessment.score >= 70 ? 'success' : 
                                                                    assessment.score >= 40 ? 'warning' : 'danger'}>
                                                                {assessment.score >= 70 ? 'Excellent' : 
                                                                 assessment.score >= 40 ? 'Good' : 'Needs Improvement'}
                                                            </Badge>
                                                            <small className="text-muted d-block mt-2">
                                                                Completed on: {formatDate(assessment.completionDate)}
                                                            </small>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p>No assessment results to display.</p>
                                    <p className="text-muted">Assessment results shared from the Assessments page will appear here.</p>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>
            
            {/* Success Modal */}
            <Modal show={showSaveModal} onHide={() => setShowSaveModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Success</Modal.Title>
                </Modal.Header>
                <Modal.Body>Profile saved successfully!</Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={() => setShowSaveModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            
            {/* Clear Confirmation Modal */}
            <Modal show={showClearModal} onHide={() => setShowClearModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to clear your profile?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowClearModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmClear}>
                        Clear Profile
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default StudentProfilePage;