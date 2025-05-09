import React, { useState, useEffect } from 'react';
import { Button, Badge, Modal, ListGroup } from 'react-bootstrap';
import { BsBell } from 'react-icons/bs';

/**
 * NotificationButton Component - Shows internship applications as notifications
 * 
 * This component is designed to be placed under the LogoutButton
 * in the CompanyDashBoard page.
 */
function NotificationButton({ onViewApplication }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Load notifications on component mount and set up periodic check
  useEffect(() => {
    loadNotifications();
    
    // Check for new notifications every minute
    const interval = setInterval(() => {
      loadNotifications();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Function to load notifications from localStorage
  const loadNotifications = () => {
    try {
      // Get current user
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) return;
      
      const companyId = currentUser.id;
      const companyName = currentUser.name;
      
      // Get all applications from localStorage
      const appliedInternships = JSON.parse(localStorage.getItem('appliedInternships')) || [];
      
      // Get all internships
      const allInternships = JSON.parse(localStorage.getItem('postedInternships')) || [];
      
      // Filter internships belonging to this company
      const companyInternships = allInternships.filter(
        internship => internship.companyId === companyId || internship.companyName === companyName
      );
      
      // Filter applications for company's internships
      const companyApplications = appliedInternships.filter(app => {
        const internship = companyInternships.find(i => i.id === app.internshipId);
        return !!internship;
      }).map(app => {
        const internship = companyInternships.find(i => i.id === app.internshipId);
        return {
          ...app,
          internshipTitle: internship ? internship.title : 'Unknown Position'
        };
      });
      
      // Sort by date (newest first)
      companyApplications.sort((a, b) => 
        new Date(b.applicationDate) - new Date(a.applicationDate)
      );
      
      // Check read status against localStorage
      const readNotifications = JSON.parse(localStorage.getItem('companyReadNotifications') || '[]');
      const notificationsWithReadStatus = companyApplications.map(app => ({
        ...app,
        read: readNotifications.includes(app.id)
      }));
      
      setNotifications(notificationsWithReadStatus);
      setUnreadCount(notificationsWithReadStatus.filter(n => !n.read).length);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };
  
  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    const notificationIds = notifications.map(n => n.id);
    localStorage.setItem('companyReadNotifications', JSON.stringify(notificationIds));
    
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };
  
  // Handle clicking on a notification
  const handleNotificationClick = (notification) => {
    // Mark as read in localStorage
    const readNotifications = JSON.parse(localStorage.getItem('companyReadNotifications') || '[]');
    if (!readNotifications.includes(notification.id)) {
      const updatedReadNotifications = [...readNotifications, notification.id];
      localStorage.setItem('companyReadNotifications', JSON.stringify(updatedReadNotifications));
      
      // Update state
      setNotifications(notifications.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    }
    
    // Close modal
    setShowNotifications(false);
    
    // Call parent handler to show application details
    if (onViewApplication) {
      onViewApplication(notification);
    }
  };

  return (
    <>
      {/* Notification Bell Button */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <Button 
          variant="outline-primary" 
          onClick={() => setShowNotifications(true)}
          style={{ 
            borderRadius: '50%', 
            width: '42px', 
            height: '42px',
            padding: '6px',
            position: 'relative'
          }}
        >
          <BsBell size={20} />
          {unreadCount > 0 && (
            <Badge 
              bg="primary"
              pill
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                fontSize: '0.7rem',
                minWidth: '18px'
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>
      
      {/* Notifications Modal */}
      <Modal 
        show={showNotifications} 
        onHide={() => setShowNotifications(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <BsBell className="me-2" /> Notifications
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '400px', overflow: 'auto' }}>
          {notifications.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <p>No applications received yet</p>
            </div>
          ) : (
            <ListGroup variant="flush">
              {notifications.map(notification => (
                <ListGroup.Item 
                  key={notification.id} 
                  action
                  onClick={() => handleNotificationClick(notification)}
                  style={{ 
                    backgroundColor: notification.read ? 'inherit' : 'rgba(96, 163, 217, 0.1)', 
                    borderLeft: notification.read ? 'none' : '3px solid var(--royal-blue)',
                    padding: '10px',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  <div>
                    <strong>{notification.studentName}</strong> applied for <strong>{notification.internshipTitle}</strong>
                    {!notification.read && (
                      <div 
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '10px',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--royal-blue)',
                        }}
                      />
                    )}
                  </div>
                  <small className="text-muted">
                    {new Date(notification.applicationDate).toLocaleString()}
                  </small>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
        <Modal.Footer>
          {unreadCount > 0 && (
            <Button variant="link" size="sm" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowNotifications(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default NotificationButton;