import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Badge, Modal, Form, InputGroup, Row, Col } from 'react-bootstrap';
import WorkshopRating from './WorkshopRating';
import CertificateNotification from './CertificateNotification';
import '../css/workshopRating.css';

const LiveWorkshops = ({ studentId }) => {
  const [liveWorkshops, setLiveWorkshops] = useState([
    {
      id: 1,
      title: "Interview Skills for Tech Companies",
      instructor: "Dr. David Miller",
      startTime: "11:00 AM",
      endTime: "12:30 PM",
      date: "May 10, 2025",
      attendees: 24,
      status: "live" // live, upcoming, or ended
    },
    {
      id: 2,
      title: "Networking Strategies for Career Growth",
      instructor: "Prof. Emily Wong",
      startTime: "2:00 PM",
      endTime: "3:30 PM",
      date: "May 9, 2025",
      attendees: 18,
      status: "live" // live, upcoming, or ended
    },
    {
      id: 3,
      title: "Personal Branding on LinkedIn",
      instructor: "Sarah Johnson, Career Coach",
      startTime: "10:00 AM",
      endTime: "11:30 AM",
      date: "May 12, 2025",
      attendees: 0,
      status: "upcoming" // live, upcoming, or ended
    }
  ]);

  const [showLiveSession, setShowLiveSession] = useState(false);
  const [activeWorkshop, setActiveWorkshop] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { 
      id: 1, 
      sender: "System", 
      message: "Welcome to the workshop! Please be respectful in the chat.", 
      time: "Just now" 
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const chatMessagesRef = useRef(null);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [completedWorkshops, setCompletedWorkshops] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('');

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleJoinLive = (workshop) => {
    setActiveWorkshop(workshop);
    setShowLiveSession(true);
    // Load any previously saved notes for this workshop
    const savedNotes = localStorage.getItem(`workshop-notes-${workshop.id}`);
    if (savedNotes) {
      setNotes(savedNotes);
    } else {
      setNotes('');
    }
  };

  const handleCloseLive = () => {
    // Save notes before closing
    if (activeWorkshop && notes.trim()) {
      localStorage.setItem(`workshop-notes-${activeWorkshop.id}`, notes);
    }
    
    // Show rating form when workshop ends if it's not already rated
    if (activeWorkshop && !completedWorkshops.includes(activeWorkshop.id)) {
      setShowRatingForm(true);
    } else {
      resetWorkshopSession();
    }
  };
  
  const resetWorkshopSession = () => {
    setShowLiveSession(false);
    setShowNotes(false);
    setShowChat(true);
    setActiveWorkshop(null);
  };
  
  const handleSubmitRating = (ratingData) => {
    console.log('Rating submitted:', ratingData);
    
    // Add workshop to completed list so we don't ask for rating again
    setCompletedWorkshops([...completedWorkshops, ratingData.workshopId]);
    
    // Get the current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Create certificate for the completed workshop
    if (activeWorkshop) {
      // Get existing certificates or create empty array
      const existingCertificates = JSON.parse(localStorage.getItem(`certificates-${studentId}`)) || [];
      
      // Create new certificate
      const newCertificate = {
        id: `live-${activeWorkshop.id}-${Date.now()}`,
        workshopId: activeWorkshop.id,
        workshopTitle: activeWorkshop.title,
        instructorName: activeWorkshop.instructor,
        completionDate: new Date().toISOString(),
        workshopType: 'Live Workshop'
      };
      
      // Add to existing certificates
      const updatedCertificates = [...existingCertificates, newCertificate];
      localStorage.setItem(`certificates-${studentId}`, JSON.stringify(updatedCertificates));
      
      // Show notification
      setNotificationTitle(activeWorkshop.title);
      setShowNotification(true);
    }
    
    // Close the rating form after a short delay
    setTimeout(() => {
      setShowRatingForm(false);
      resetWorkshopSession();
    }, 1500);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    
    const newChatMessage = {
      id: chatMessages.length + 1,
      sender: "You",
      message: newMessage.trim(),
      time: "Just now"
    };
    
    setChatMessages([...chatMessages, newChatMessage]);
    setNewMessage('');
    
    // Create a notification for other users when a message is sent
    // In a real app, this would only be visible to other participants
    createChatNotification(activeWorkshop.id, activeWorkshop.title, newMessage.trim());
    
    // Simulate response from other participants
    if (Math.random() > 0.5) {
      setTimeout(() => {
        const participants = ["John D.", "Maria S.", "Alex", "Prof. " + activeWorkshop.instructor];
        const randomParticipant = participants[Math.floor(Math.random() * participants.length)];
        const responses = [
          "That's a great question!",
          "I was thinking the same thing.",
          "Could you elaborate on that point?",
          "Thanks for sharing your perspective.",
          "Let me address that question in a moment.",
          "Does anyone else have thoughts on this topic?"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const responseMessage = {
          id: chatMessages.length + 2,
          sender: randomParticipant,
          message: randomResponse,
          time: "Just now"
        };
        
        setChatMessages(prev => [...prev, responseMessage]);
        
        // Also create notification for simulated responses
        // This makes the demonstration more interactive
        createChatNotification(activeWorkshop.id, activeWorkshop.title, randomResponse, randomParticipant);
      }, 2000);
    }
  };

  // Add this new function to create chat notifications
  const createChatNotification = (workshopId, workshopTitle, message, sender = null) => {
    // Skip creating notifications for your own messages in a real app
    // For demo purposes, we're creating them for both so you can see the functionality
    
    // Get existing notifications or create empty array
    const existingNotifications = JSON.parse(localStorage.getItem('studentNotifications') || '[]');
    
    // Create notification object
    const newNotification = {
      id: `workshop-chat-${workshopId}-${Date.now()}`,
      title: `New message in ${workshopTitle}`,
      message: sender 
        ? `${sender}: ${message.substring(0, 30)}${message.length > 30 ? '...' : ''}`
        : `${message.substring(0, 30)}${message.length > 30 ? '...' : ''}`,
      date: new Date().toISOString(),
      type: 'workshop',
      workshopId: workshopId,
      workshopTitle: workshopTitle,
      sender: sender || 'You'
    };
    
    // Add to existing notifications
    const updatedNotifications = [newNotification, ...existingNotifications];
    
    // Store in localStorage (limit to most recent 50 notifications to prevent storage issues)
    localStorage.setItem('studentNotifications', JSON.stringify(updatedNotifications.slice(0, 50)));
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
    // Auto-save notes as user types (with debounce for performance)
    if (activeWorkshop) {
      localStorage.setItem(`workshop-notes-${activeWorkshop.id}`, e.target.value);
    }
  };

  const toggleNotes = () => {
    setShowNotes(!showNotes);
  };

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  return (
    <div className="live-workshops">
      <h4 className="mb-4">Live Online Workshops</h4>

      {liveWorkshops.filter(workshop => workshop.status === "live" || workshop.status === "upcoming").length > 0 ? (
        <Row xs={1} lg={2} className="g-4">
          {liveWorkshops.map(workshop => (
            <Col key={workshop.id}>
              <Card className="h-100 workshop-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title>{workshop.title}</Card.Title>
                    {workshop.status === "live" ? (
                      <Badge bg="danger" pill className="pulse-badge">
                        <span className="pulse-dot"></span> LIVE NOW
                      </Badge>
                    ) : (
                      <Badge bg="secondary" pill>UPCOMING</Badge>
                    )}
                  </div>
                  <Card.Subtitle className="mb-2 text-muted">
                    {workshop.instructor}
                  </Card.Subtitle>
                  <div className="workshop-details mb-3">
                    <p className="mb-1">
                      <i className="bi bi-calendar3 me-2"></i>
                      {workshop.date}
                    </p>
                    <p className="mb-1">
                      <i className="bi bi-clock me-2"></i>
                      {workshop.startTime} - {workshop.endTime}
                    </p>
                    <p className="mb-0">
                      <i className="bi bi-people me-2"></i>
                      {workshop.attendees} {workshop.attendees === 1 ? 'person' : 'people'} attending
                    </p>
                  </div>
                  <div className="text-end">
                    {workshop.status === "live" ? (
                      <Button 
                        variant="success" 
                        onClick={() => handleJoinLive(workshop)}
                      >
                        <i className="bi bi-camera-video-fill me-2"></i>
                        Join Live Now
                      </Button>
                    ) : (
                      <Button variant="outline-secondary" disabled>
                        <i className="bi bi-calendar-check me-2"></i>
                        Coming Soon
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center py-5">
          <i className="bi bi-camera-video-off display-4 text-secondary mb-3"></i>
          <h5>No Live Workshops Currently Available</h5>
          <p className="text-muted">Check back later for upcoming workshops or browse our pre-recorded content.</p>
        </div>
      )}

      <Modal 
        show={showLiveSession} 
        onHide={handleCloseLive}
        size="xl"
        backdrop="static"
        keyboard={false}
        className="live-workshop-modal"
        fullscreen={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {activeWorkshop?.title}
            <Badge bg="danger" pill className="ms-2 pulse-badge">
              <span className="pulse-dot"></span> LIVE
            </Badge>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="workshop-live-container">
            <Row className="g-0 h-100">
              {showNotes && (
                <Col lg={3} className="notes-sidebar">
                  <div className="notes-container d-flex flex-column h-100">
                    <div className="notes-header p-2 bg-light border-bottom">
                      <h6 className="mb-0">Workshop Notes</h6>
                      <small className="text-muted">Notes are saved automatically</small>
                    </div>
                    <Form.Control
                      as="textarea"
                      placeholder="Take notes here..."
                      value={notes}
                      onChange={handleNotesChange}
                      className="notes-textarea flex-grow-1 border-0 rounded-0"
                    />
                  </div>
                </Col>
              )}
              <Col lg={showNotes && showChat ? 5 : (showNotes || showChat ? 8 : 12)} className="video-area">
                <div className="video-container bg-dark text-light">
                  <div className="placeholder-video d-flex flex-column align-items-center justify-content-center">
                    <i className="bi bi-camera-video display-1 mb-3"></i>
                    <h4>{activeWorkshop?.instructor}'s Video Feed</h4>
                    <p className="text-center">This is a placeholder for the workshop video. In a real application, this would be a live video stream.</p>
                  </div>
                  <div className="video-controls p-2">
                    <Button variant="outline-light" size="sm" className="me-2">
                      <i className="bi bi-mic-mute"></i>
                    </Button>
                    <Button variant="outline-light" size="sm" className="me-2">
                      <i className="bi bi-camera-video"></i>
                    </Button>
                    <Button variant="outline-light" size="sm" className="me-2">
                      <i className="bi bi-hand-index-thumb"></i>
                    </Button>
                    <Button 
                      variant={showNotes ? "light" : "outline-light"} 
                      size="sm" 
                      className="me-2"
                      onClick={toggleNotes}
                    >
                      <i className="bi bi-journal-text me-1"></i>
                      Notes
                    </Button>
                    <Button 
                      variant={showChat ? "light" : "outline-light"}
                      size="sm"
                      className="me-2"
                      onClick={toggleChat}
                    >
                      <i className="bi bi-chat-text me-1"></i>
                      Chat
                    </Button>
                    <Button variant="danger" size="sm" onClick={handleCloseLive}>
                      Leave
                    </Button>
                  </div>
                </div>
              </Col>
              {showChat && (
                <Col lg={4} className="chat-area d-flex flex-column">
                  <div className="chat-header p-2 bg-light border-bottom">
                    <h6 className="mb-0">Workshop Chat ({chatMessages.length - 1} messages)</h6>
                  </div>
                  <div 
                    className="chat-messages p-3" 
                    ref={chatMessagesRef}
                  >
                    {chatMessages.map(msg => (
                      <div key={msg.id} className={`chat-message ${msg.sender === "You" ? "chat-message-own" : ""}`}>
                        <div className="message-sender">
                          <strong>{msg.sender}</strong> <small className="text-muted">{msg.time}</small>
                        </div>
                        <div className="message-content">{msg.message}</div>
                      </div>
                    ))}
                  </div>
                  <Form onSubmit={handleSendMessage} className="chat-input-area p-2 border-top mt-auto">
                    <InputGroup>
                      <Form.Control
                        placeholder="Type your message or question..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                      <Button type="submit" variant="primary" className="send-button">
                        <i className="bi bi-send-fill"></i>
                      </Button>
                    </InputGroup>
                  </Form>
                </Col>
              )}
            </Row>
          </div>
        </Modal.Body>
      </Modal>

      {/* Workshop Rating Modal */}
      <Modal
        show={showRatingForm}
        onHide={() => {
          setShowRatingForm(false);
          resetWorkshopSession();
        }}
        centered
      >
        <Modal.Body className="p-0">
          <WorkshopRating 
            workshopId={activeWorkshop?.id} 
            workshopTitle={activeWorkshop?.title}
            onSubmitRating={handleSubmitRating}
          />
        </Modal.Body>
      </Modal>

      {/* Notification for certificate */}
      <CertificateNotification
        show={showNotification}
        onClose={() => setShowNotification(false)}
        workshopTitle={notificationTitle}
      />
    </div>
  );
};

export default LiveWorkshops;