import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Button, Badge, Container, Row, Col } from 'react-bootstrap';
import { BsCircleFill, BsCameraVideoFill } from 'react-icons/bs';
import { students } from '../Data/UserData';
import '../css/AppointmentSystem.css';
import VideoCallComponent from './VideoCallComponent';

const AppointmentSystem = ({ userType, studentId }) => {
  const [showModal, setShowModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [newAppointment, setNewAppointment] = useState({
    date: '',
    time: '',
    purpose: '',
    status: 'pending',
    studentId: studentId || '',
    studentName: '',
    requestedBy: userType,
  });
  
  // Video call states
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  
  // Use refs to store intervals so they can be properly cleared
  const onlineStatusIntervalRef = useRef(null);
  const incomingCallIntervalRef = useRef(null);

  useEffect(() => {
    // Load appointments
    const storedAppointments = JSON.parse(localStorage.getItem('appointments')) || [];
    setAppointments(storedAppointments);

    // Simulate online status (implemented once)
    const simulateOnlineStatus = () => {
      const mockOnlineStatus = {};
      students.forEach(student => {
        // Randomly set some students as online (70% chance)
        mockOnlineStatus[student.gucId] = Math.random() > 0.3;
      });
      setOnlineUsers(prev => ({...mockOnlineStatus}));
    };
    
    // Run initial simulation
    simulateOnlineStatus();
    
    // Set up interval for status updates (30 seconds = 30000ms)
    onlineStatusIntervalRef.current = setInterval(simulateOnlineStatus, 30000);
    
    // Check for incoming calls (every 2 seconds)
    const checkIncomingCalls = () => {
      if (userType === 'student') {
        const callHistory = JSON.parse(localStorage.getItem('callHistory') || '[]');
        const incomingCalls = callHistory.filter(call => 
          call.participants.includes(studentId) && 
          call.status === 'active' && 
          !call.rejected &&
          !call.accepted
        );
        
        if (incomingCalls.length > 0) {
          const latestCall = incomingCalls[0];
          
          // Find the appointment associated with this call
          const appointment = appointments.find(apt => apt.id === latestCall.appointmentId);
          
          if (appointment) {
            setIncomingCall({
              ...latestCall,
              purpose: appointment.purpose,
              remoteUser: 'SCAD Officer'
            });
          }
        } else {
          setIncomingCall(null);
        }
      }
    };
    
    // Set up interval for checking incoming calls
    incomingCallIntervalRef.current = setInterval(checkIncomingCalls, 2000);
    
    // Clean up all intervals when component unmounts
    return () => {
      if (onlineStatusIntervalRef.current) {
        clearInterval(onlineStatusIntervalRef.current);
      }
      if (incomingCallIntervalRef.current) {
        clearInterval(incomingCallIntervalRef.current);
      }
    };
  }, [studentId, userType]); // Only re-run when these dependencies change

  const handleSubmit = (e) => {
    e.preventDefault();
    const student = students.find(s => s.gucId === (userType === 'student' ? studentId : newAppointment.studentId));
    
    const appointment = {
      ...newAppointment,
      id: Date.now(),
      studentName: student?.name || 'Unknown Student',
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    const updatedAppointments = [...appointments, appointment];
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    setAppointments(updatedAppointments);
    setShowModal(false);
    setNewAppointment({
      date: '',
      time: '',
      purpose: '',
      status: 'pending',
      studentId: studentId || '',
      studentName: '',
      requestedBy: userType,
    });
  };

  const handleStatusChange = (appointmentId, newStatus) => {
    const updatedAppointments = appointments.map(apt => {
      if (apt.id === appointmentId) {
        // Create a notification when the status changes to approved
        if (newStatus === 'approved') {
          createAppointmentNotification(apt);
        }
        return { ...apt, status: newStatus };
      }
      return apt;
    });
    
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    setAppointments(updatedAppointments);
    
    // Refresh notifications by triggering a custom event
    const event = new CustomEvent('refresh-notifications');
    window.dispatchEvent(event);
  };

  // Function to create a notification when an appointment is approved
  const createAppointmentNotification = (appointment) => {
    try {
      // Check if the student is a pro member
      const student = students.find(s => s.gucId === appointment.studentId);
      
      if (student && student.pro) {
        // Get existing notifications
        const notifications = JSON.parse(localStorage.getItem('studentNotifications') || '[]');
        
        // Create a new notification
        const newNotification = {
          id: `appointment-${appointment.id}-${Date.now()}`,
          title: 'Appointment Approved',
          message: `Your appointment on ${appointment.date} at ${appointment.time} has been approved.`,
          date: new Date().toISOString(),
          type: 'appointment',
          appointmentId: appointment.id,
          read: false
        };
        
        // Add notification to the beginning of the array (newest first)
        notifications.unshift(newNotification);
        
        // Update localStorage
        localStorage.setItem('studentNotifications', JSON.stringify(notifications));
      }
    } catch (error) {
      console.error("Error creating appointment notification:", error);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'warning';
    }
  };

  // Function to initiate a video call
  const initiateVideoCall = (appointment) => {
    // Create a record of this call
    const callHistory = JSON.parse(localStorage.getItem('callHistory') || '[]');
    const newCall = {
      id: Date.now(),
      appointmentId: appointment.id,
      startTime: new Date().toISOString(),
      participants: [appointment.studentId],
      status: 'active',
      initiator: userType // Add this to identify who started the call
    };
    
    callHistory.push(newCall);
    localStorage.setItem('callHistory', JSON.stringify(callHistory));
    
    // Set active call data for the initiator (SCAD)
    setActiveCall({
      ...newCall,
      remoteUser: appointment.studentName,
      purpose: appointment.purpose
    });
    setShowVideoCall(true);
    
    // Also trigger a browser notification if supported
    if (Notification.permission === "granted") {
      new Notification("Video Call Initiated", {
        body: `Call to ${appointment.studentName} has been initiated`,
        icon: "/logo.png"
      });
    }
  };
  
  // Handle accepting an incoming call
  const handleAcceptCall = () => {
    if (!incomingCall) return;
    
    const callHistory = JSON.parse(localStorage.getItem('callHistory') || '[]');
    const updatedCallHistory = callHistory.map(call => {
      if (call.id === incomingCall.id) {
        return {
          ...call,
          accepted: true
        };
      }
      return call;
    });
    
    localStorage.setItem('callHistory', JSON.stringify(updatedCallHistory));
    
    // Set the call as active and show the video call component
    setActiveCall(incomingCall);
    setIncomingCall(null);
    setShowVideoCall(true);
  };
  
  // Handle rejecting an incoming call
  const handleRejectCall = () => {
    if (!incomingCall) return;
    
    const callHistory = JSON.parse(localStorage.getItem('callHistory') || '[]');
    const updatedCallHistory = callHistory.map(call => {
      if (call.id === incomingCall.id) {
        return {
          ...call,
          rejected: true,
          status: 'rejected',
          endTime: new Date().toISOString()
        };
      }
      return call;
    });
    
    localStorage.setItem('callHistory', JSON.stringify(updatedCallHistory));
    setIncomingCall(null);
  };
  
  // Handle ending a call
  const handleEndCall = () => {
    setShowVideoCall(false);
    setActiveCall(null);
  };

  return (
    <Container className="appointment-system my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Video Call Appointments</h4>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          {userType === 'student' ? 'Request Appointment' : 'Schedule Meeting'}
        </Button>
      </div>

      <Row className="appointments-list">
        {appointments
          .filter(apt => userType === 'scad' || apt.studentId === studentId)
          .map(apt => (
            <Col key={apt.id} xs={12} className="mb-3">
              <div className="appointment-card">
                <div className="appointment-info">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5>{apt.purpose}</h5>
                    {userType === 'student' ? (
                      <Badge bg="info">SCAD</Badge>
                    ) : (
                      <div className="online-status-indicator">
                        {onlineUsers[apt.studentId] ? (
                          <Badge bg="success" className="d-flex align-items-center">
                            <BsCircleFill className="me-1" size={8} /> Online
                          </Badge>
                        ) : (
                          <Badge bg="secondary" className="d-flex align-items-center">
                            <BsCircleFill className="me-1" size={8} /> Offline
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="mb-2">Date: {apt.date} at {apt.time}</p>
                  <p className="mb-2">
                    {apt.requestedBy === 'student' 
                      ? `Requested by: ${apt.studentName} (${apt.studentId})`
                      : `Scheduled by SCAD for: ${apt.studentName} (${apt.studentId})`}
                    {apt.studentId && students.find(s => s.gucId === apt.studentId)?.pro && (
                      <Badge 
                        className="ms-2 pro-badge"
                        style={{ 
                          backgroundColor: '#ffd700',
                          color: '#000'
                        }}
                      >
                        PRO
                      </Badge>
                    )}
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <Badge bg={getStatusBadgeVariant(apt.status)}>
                      {apt.status.toUpperCase()}
                    </Badge>
                    
                    {/* Video Call Button for approved appointments with online users */}
                    {apt.status === 'approved' && 
                     ((userType === 'student' && onlineUsers[studentId]) || 
                      (userType === 'scad' && onlineUsers[apt.studentId])) && (
                      <Button 
                        variant="success" 
                        size="sm" 
                        className="video-call-button"
                        onClick={() => initiateVideoCall(apt)}
                      >
                        <BsCameraVideoFill className="me-1" /> Start Video Call
                      </Button>
                    )}
                  </div>
                </div>
                {apt.status === 'pending' && apt.requestedBy !== userType && (
                  <div className="appointment-actions">
                    <Button 
                      variant="success" 
                      size="sm" 
                      onClick={() => handleStatusChange(apt.id, 'approved')}
                    >
                      Approve
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleStatusChange(apt.id, 'rejected')}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </Col>
          ))}
      </Row>

      {/* Appointment Creation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {userType === 'student' ? 'Request Appointment' : 'Schedule Meeting'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {userType === 'scad' && (
              <Form.Group className="mb-3">
                <Form.Label>Student GUC ID</Form.Label>
                <Form.Control
                  type="text"
                  required
                  placeholder="Enter student GUC ID (e.g., 49-12345)"
                  value={newAppointment.studentId}
                  onChange={(e) => {
                    const student = students.find(s => s.gucId === e.target.value);
                    setNewAppointment({
                      ...newAppointment,
                      studentId: e.target.value,
                      studentName: student?.name || ''
                    });
                  }}
                />
                {newAppointment.studentName && (
                  <Form.Text className="text-success">
                    Student found: {newAppointment.studentName}
                  </Form.Text>
                )}
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                required
                value={newAppointment.date}
                onChange={(e) => setNewAppointment({
                  ...newAppointment,
                  date: e.target.value
                })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Time</Form.Label>
              <Form.Control
                type="time"
                required
                value={newAppointment.time}
                onChange={(e) => setNewAppointment({
                  ...newAppointment,
                  time: e.target.value
                })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Purpose</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                required
                placeholder="Please describe the purpose of your appointment"
                value={newAppointment.purpose}
                onChange={(e) => setNewAppointment({
                  ...newAppointment,
                  purpose: e.target.value
                })}
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* Video Call Component */}
      <VideoCallComponent
        isVisible={showVideoCall}
        onHide={handleEndCall}
        callData={activeCall}
      />
      
      {/* Incoming Call Component */}
      <VideoCallComponent
        isVisible={incomingCall !== null}
        onHide={handleRejectCall}
        callData={incomingCall}
        isIncoming={true}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
      />
    </Container>
  );
};

export default AppointmentSystem;