import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Badge, Container, Row, Col } from 'react-bootstrap';
import { students } from '../Data/UserData';
import '../css/AppointmentSystem.css';

const AppointmentSystem = ({ userType, studentId }) => {
  const [showModal, setShowModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    date: '',
    time: '',
    purpose: '',
    status: 'pending',
    studentId: studentId || '',
    studentName: '',
    requestedBy: userType,
  });

  useEffect(() => {
    const storedAppointments = JSON.parse(localStorage.getItem('appointments')) || [];
    setAppointments(storedAppointments);
  }, []);

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
                  <h5>{apt.purpose}</h5>
                  <p>Date: {apt.date} at {apt.time}</p>
                  <p>
                    {apt.requestedBy === 'student' 
                      ? `Requested by: ${apt.studentName} (${apt.studentId})`
                      : `Scheduled by SCAD for: ${apt.studentName} (${apt.studentId})`}
                  </p>
                  <Badge bg={getStatusBadgeVariant(apt.status)}>
                    {apt.status.toUpperCase()}
                  </Badge>
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
    </Container>
  );
};

export default AppointmentSystem;