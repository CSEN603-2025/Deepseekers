import React, { useState, useEffect } from 'react';
import { Button, Badge, Modal, ListGroup } from 'react-bootstrap';
import { BsBell } from 'react-icons/bs';

/**
 * NotificationButton Component - Shows notifications based on user role
 * 
 * This component is designed to handle notifications for different user roles:
 * - For companies: Shows internship applications as notifications
 * - For students: Shows internship cycle updates as notifications
 */
function NotificationButton({ onViewApplication, userRole = 'company' }) {
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
  }, [userRole]);
  
  // Add this useEffect to listen for the custom event
  useEffect(() => {
    const handleRefreshNotifications = () => {
      loadNotifications();
    };
    
    window.addEventListener('refresh-notifications', handleRefreshNotifications);
    
    return () => {
      window.removeEventListener('refresh-notifications', handleRefreshNotifications);
    };
  }, []);
  
  // Function to load notifications from localStorage
  const loadNotifications = () => {
    if (userRole === 'company') {
      loadCompanyNotifications();
    } else if (userRole === 'student') {
      loadStudentNotifications();
    }
  };

  // Load company-specific notifications (application notifications)
  const loadCompanyNotifications = () => {
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
          internshipTitle: internship ? internship.title : 'Unknown Position',
          type: 'application'
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
      console.error("Error loading company notifications:", error);
    }
  };

  // Update the loadStudentNotifications function to include workshop chat notifications
  const loadStudentNotifications = () => {
    try {
      // Get current user
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) return;
      
      // Get internship cycle notifications from internshipCycles array
      const internshipCycles = JSON.parse(localStorage.getItem('internshipCycles')) || [];
      
      // Also check direct cycle dates from localStorage
      const cycleStartDate = localStorage.getItem('internshipCycleStartDate');
      const cycleEndDate = localStorage.getItem('internshipCycleEndDate');
      
      let allNotifications = [];
      
      // Create notifications from internship cycles array
      const cycleNotifications = internshipCycles.map(cycle => ({
        id: cycle.id || `cycle-${new Date().getTime()}`,
        title: cycle.title || 'New Internship Cycle',
        message: cycle.message || `${cycle.title || 'An internship cycle'} has been ${cycle.status === 'active' ? 'activated' : 'set'} from ${new Date(cycle.startDate).toLocaleDateString()} to ${new Date(cycle.endDate).toLocaleDateString()}.`,
        date: cycle.startDate || new Date().toISOString(),
        type: 'cycle',
        cycleId: cycle.id,
        startDate: cycle.startDate,
        endDate: cycle.endDate,
        status: cycle.status
      }));
      
      allNotifications = [...cycleNotifications];
      
      // If cycle dates are set in localStorage, create a direct notification
      if (cycleStartDate && cycleEndDate) {
        const startDate = new Date(cycleStartDate);
        const endDate = new Date(cycleEndDate);
        const now = new Date();
        const isActive = now >= startDate && now <= endDate;
        
        // Create a notification ID that will be consistent for this cycle
        const directCycleId = `direct-cycle-${startDate.getTime()}-${endDate.getTime()}`;
        
        // Check if this notification already exists in the array
        const existingNotification = allNotifications.some(n => n.id === directCycleId);
        
        if (!existingNotification) {
          allNotifications.push({
            id: directCycleId,
            title: isActive ? 'Internship Cycle Active' : 'Internship Cycle Scheduled',
            message: isActive 
              ? `The internship cycle is currently ACTIVE! It runs from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}.`
              : `An internship cycle has been scheduled from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}.`,
            date: new Date().toISOString(),
            type: 'cycle',
            startDate: cycleStartDate,
            endDate: cycleEndDate,
            status: isActive ? 'active' : 'scheduled'
          });
        }
      }
      
      // Get workshop notifications from localStorage (includes chat messages now)
      const workshopNotifications = JSON.parse(localStorage.getItem('studentNotifications') || '[]');
      
      // Add workshop notifications to all notifications
      allNotifications = [...allNotifications, ...workshopNotifications];
      
      // Sort by date (newest first)
      allNotifications.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Check read status against localStorage
      const readNotifications = JSON.parse(localStorage.getItem('studentReadNotifications') || '[]');
      const notificationsWithReadStatus = allNotifications.map(notification => ({
        ...notification,
        read: readNotifications.includes(notification.id)
      }));
      
      setNotifications(notificationsWithReadStatus);
      setUnreadCount(notificationsWithReadStatus.filter(n => !n.read).length);
    } catch (error) {
      console.error("Error loading student notifications:", error);
    }
  };
  
  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    const notificationIds = notifications.map(n => n.id);
    const storageKey = userRole === 'company' ? 'companyReadNotifications' : 'studentReadNotifications';
    
    localStorage.setItem(storageKey, JSON.stringify(notificationIds));
    
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };
  
  // Handle clicking on a notification
  const handleNotificationClick = (notification) => {
    const storageKey = userRole === 'company' ? 'companyReadNotifications' : 'studentReadNotifications';
    
    // Mark as read in localStorage
    const readNotifications = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!readNotifications.includes(notification.id)) {
      const updatedReadNotifications = [...readNotifications, notification.id];
      localStorage.setItem(storageKey, JSON.stringify(updatedReadNotifications));
      
      // Update state
      setNotifications(notifications.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    }
    
    // Close modal
    setShowNotifications(false);
    
    // For company notifications, call parent handler to show application details
    if (userRole === 'company' && onViewApplication && notification.type === 'application') {
      onViewApplication(notification);
    }
    
    // For student notifications, navigate to relevant page or show more details
    if (userRole === 'student') {
      if (notification.type === 'cycle') {
        // If there's a specific action for cycle notifications, it would go here
        // For example: navigate to internships page
      } else if (notification.type === 'appointment') {
        // Navigate to appointments page or scroll to appointments section
        // This depends on your app's routing structure
        if (window.location.pathname !== '/profile') {
          window.location.href = '/profile#appointments';
        } else {
          // If already on profile page, scroll to appointments section
          document.getElementById('appointments-section')?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  // Update the renderNotificationItem function to handle workshop chat messages
  const renderNotificationItem = (notification) => {
    if (userRole === 'company' && notification.type === 'application') {
      return (
        <>
          <div>
            <strong>{notification.studentName}</strong> applied for <strong>{notification.internshipTitle}</strong>
          </div>
          <small className="text-muted">
            {new Date(notification.applicationDate).toLocaleString()}
          </small>
        </>
      );
    } else if (userRole === 'student' && notification.type === 'cycle') {
      return (
        <>
          <div>
            <strong>{notification.title}</strong>
          </div>
          <div>{notification.message}</div>
          <small className="text-muted">
            {new Date(notification.date).toLocaleString()}
          </small>
        </>
      );
    } else if (userRole === 'student' && notification.type === 'workshop') {
      return (
        <>
          <div>
            <i className="bi bi-chat-dots me-2 text-primary"></i>
            <strong>{notification.title}</strong>
          </div>
          <div>
            <span className="fst-italic">{notification.sender}:</span> {notification.message}
          </div>
          <small className="text-muted">
            {new Date(notification.date).toLocaleString()}
          </small>
        </>
      );
    } else if (userRole === 'student' && notification.type === 'appointment') {
      return (
        <>
          <div>
            <i className="bi bi-calendar-check me-2 text-success"></i>
            <strong>{notification.title}</strong>
          </div>
          <div>{notification.message}</div>
          <small className="text-muted">
            {new Date(notification.date).toLocaleString()}
          </small>
        </>
      );
    } else {
      return (
        <>
          <div>{notification.message || "New notification"}</div>
          <small className="text-muted">
            {new Date(notification.date).toLocaleString()}
          </small>
        </>
      );
    }
  };

  return (
    <div className="position-relative">
      {/* Notification Bell Button */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <Button 
          variant="outline-primary" 
          onClick={() => setShowNotifications(!showNotifications)} // Toggle instead of just setting to true
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
      
      {/* Notifications Dropdown */}
      {showNotifications && (
        <div 
          className="position-absolute end-0 mt-2 notification-dropdown" 
          style={{ 
            width: '350px', 
            maxHeight: '500px', 
            overflowY: 'auto', 
            zIndex: 1000, 
            borderRadius: '8px', 
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)', 
            background: 'white', // Explicitly set white background
            border: '1px solid #ddd' 
          }}
        >
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
            <h6 className="m-0">Notifications</h6>
            {notifications.length > 0 && (
              <Button 
                variant="link" 
                size="sm" 
                onClick={handleMarkAllAsRead}
                style={{
                  color: 'var(--primary)',
                  textDecoration: 'underline',
                  padding: '0',
                  fontSize: '0.875rem'
                }}
              >
                Mark all as read
              </Button>
            )}
          </div>
          
          {notifications.length > 0 ? (
            <div>
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item p-3 border-bottom ${notification.read ? '' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                  style={{ 
                    cursor: 'pointer', 
                    backgroundColor: notification.read ? 'white' : '#f0f7ff',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = notification.read ? '#f8f9fa' : '#e6f2ff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notification.read ? 'white' : '#f0f7ff'}
                >
                  {renderNotificationItem(notification)}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted">
              <i className="bi bi-bell-slash mb-2 d-block" style={{ fontSize: '1.5rem' }}></i>
              <p className="mb-0">No notifications yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationButton;