import React, { useState, useEffect } from 'react';
import { Button, Badge, Modal, ListGroup } from 'react-bootstrap';
import { BsEye } from 'react-icons/bs';

/**
 * ProfileViewsButton Component - Shows which companies viewed a student's profile
 * 
 * This component is only available for PRO students and displays a list of
 * companies that have viewed their profile along with the timestamp.
 */
function ProfileViewsButton() {
  const [showViews, setShowViews] = useState(false);
  const [profileViews, setProfileViews] = useState([]);
  const [viewCount, setViewCount] = useState(0);
  const [isPro, setIsPro] = useState(false);
  
  // Load profile views and check pro status on component mount
  useEffect(() => {
    checkProStatus();
    loadProfileViews();
  }, []);

  const checkProStatus = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    setIsPro(currentUser?.pro === true);
  };
  
  const loadProfileViews = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) return;
      
      // Get profile views from localStorage, or initialize if not present
      const studentId = currentUser.id;
      let views = JSON.parse(localStorage.getItem(`profileViews-${studentId}`)) || [];
      
      // For demo purposes, if no views exist, create some sample views
      if (views.length === 0) {
        views = [
          {
            id: 1,
            companyName: "Tech Innovators",
            viewDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            viewed: false
          },
          {
            id: 2,
            companyName: "Global Solutions Inc.",
            viewDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            viewed: false
          },
          {
            id: 3,
            companyName: "Future Systems",
            viewDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            viewed: true
          }
        ];
        localStorage.setItem(`profileViews-${studentId}`, JSON.stringify(views));
      }
      
      // Count unviewed profile views
      const unviewedCount = views.filter(view => !view.viewed).length;
      
      setProfileViews(views);
      setViewCount(unviewedCount);
    } catch (error) {
      console.error('Error loading profile views:', error);
    }
  };
  
  const handleViewsClick = () => {
    if (isPro) {
      setShowViews(true);
      
      // Mark all views as viewed
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser) {
        const studentId = currentUser.id;
        const updatedViews = profileViews.map(view => ({
          ...view,
          viewed: true
        }));
        
        localStorage.setItem(`profileViews-${studentId}`, JSON.stringify(updatedViews));
        setProfileViews(updatedViews);
        setViewCount(0);
      }
    } else {
      // Show upgrade prompt for non-PRO users
      alert("This feature is only available for PRO students. Please upgrade to view your profile visitors.");
    }
  };
  
  const handleCloseViews = () => {
    setShowViews(false);
  };
  
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString(undefined, options);
  };
  
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const viewDate = new Date(dateString);
    const diffMs = now - viewDate;
    
    // Convert to appropriate time unit
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <>
      <Button 
        variant="link" 
        className="profile-views-button position-relative p-0"
        onClick={handleViewsClick}
        aria-label="Profile Views"
      >
        <div className="d-flex align-items-center">
          <BsEye className="profile-views-icon" size={22} />
          <Badge className="ms-1 pro-badge">PRO</Badge>
          {viewCount > 0 && (
            <Badge 
              bg="danger" 
              pill 
              className="position-absolute profile-views-count"
            >
              {viewCount}
            </Badge>
          )}
        </div>
      </Button>
      
      <Modal show={showViews} onHide={handleCloseViews}>
        <Modal.Header closeButton>
          <Modal.Title>Profile Views</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {profileViews.length > 0 ? (
            <ListGroup variant="flush">
              {profileViews.map((view) => (
                <ListGroup.Item key={view.id} className="py-3">
                  <div className="d-flex justify-content-between align-items-top mb-1">
                    <h6 className="mb-0">{view.companyName}</h6>
                    <small className="text-muted">{getTimeAgo(view.viewDate)}</small>
                  </div>
                  <small className="text-muted d-block">
                    Viewed your profile on {formatDate(view.viewDate)}
                  </small>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <div className="text-center p-4">
              <p>No companies have viewed your profile yet.</p>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default ProfileViewsButton;