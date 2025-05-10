import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Button, Modal, Form } from 'react-bootstrap';
import { workshops as initialWorkshops } from '../Data/WorkshopsData';
import '../css/WorkshopList.css';

const WorkshopList = ({ studentId }) => {
  const [workshops, setWorkshops] = useState([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [registrationNote, setRegistrationNote] = useState('');
  const [filter, setFilter] = useState('upcoming');

  useEffect(() => {
    const storedWorkshops = JSON.parse(localStorage.getItem('workshops'));
    if (storedWorkshops) {
      setWorkshops(storedWorkshops);
    } else {
      setWorkshops(initialWorkshops);
    }
  }, []);

  const handleViewDetails = (workshop) => {
    setSelectedWorkshop(workshop);
    setShowModal(true);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    
    // Check if student is already registered
    const alreadyRegistered = selectedWorkshop.registeredStudents.includes(studentId);
    
    if (alreadyRegistered) {
      // Unregister student
      const updatedWorkshops = workshops.map(w => {
        if (w.id === selectedWorkshop.id) {
          return {
            ...w, 
            registeredStudents: w.registeredStudents.filter(id => id !== studentId)
          };
        }
        return w;
      });
      
      setWorkshops(updatedWorkshops);
      setSelectedWorkshop({
        ...selectedWorkshop,
        registeredStudents: selectedWorkshop.registeredStudents.filter(id => id !== studentId)
      });
      localStorage.setItem('workshops', JSON.stringify(updatedWorkshops));
      
      // Create cancellation notification
      createNotification(
        "Workshop Registration Cancelled",
        `You have cancelled your registration for "${selectedWorkshop.title}" on ${formatDate(selectedWorkshop.startDate)}.`
      );
    } else {
      // Register student
      const updatedWorkshops = workshops.map(w => {
        if (w.id === selectedWorkshop.id) {
          return {
            ...w, 
            registeredStudents: [...w.registeredStudents, studentId]
          };
        }
        return w;
      });
      
      setWorkshops(updatedWorkshops);
      setSelectedWorkshop({
        ...selectedWorkshop,
        registeredStudents: [...selectedWorkshop.registeredStudents, studentId]
      });
      localStorage.setItem('workshops', JSON.stringify(updatedWorkshops));
      
      // Create registration notification
      createNotification(
        "Workshop Registration Confirmed",
        `You have successfully registered for "${selectedWorkshop.title}" on ${formatDate(selectedWorkshop.startDate)} at ${selectedWorkshop.startTime}.`
      );
    }
    
    // Reset registration note and close the modal
    setRegistrationNote('');
    setShowModal(false);
  };
  
  // Function to create notifications in localStorage
  const createNotification = (title, message) => {
    // Get existing student notifications or initialize empty array
    const notifications = JSON.parse(localStorage.getItem('studentNotifications') || '[]');
    
    // Create new notification with unique ID
    const newNotification = {
      id: `workshop-${selectedWorkshop.id}-${Date.now()}`,
      title: title,
      message: message,
      date: new Date().toISOString(),
      type: 'workshop',
      workshopId: selectedWorkshop.id
    };
    
    // Add notification to beginning of array (newest first)
    notifications.unshift(newNotification);
    
    // Save back to localStorage
    localStorage.setItem('studentNotifications', JSON.stringify(notifications));
  };

  const isWorkshopUpcoming = (workshop) => {
    const today = new Date();
    const workshopDate = new Date(workshop.startDate);
    return workshopDate >= today;
  };

  const isRegistered = (workshop) => {
    return workshop.registeredStudents.includes(studentId);
  };

  const filteredWorkshops = workshops.filter(workshop => {
    if (filter === 'upcoming') {
      return isWorkshopUpcoming(workshop);
    } else if (filter === 'registered') {
      return isRegistered(workshop);
    } else {
      return true;
    }
  });

  const formatDate = (dateStr) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  return (
    <div className="workshop-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Career Workshops</h3>
        <Form.Select 
          style={{ width: 'auto' }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Workshops</option>
          <option value="upcoming">Upcoming Workshops</option>
          <option value="registered">My Registered Workshops</option>
        </Form.Select>
      </div>

      {filteredWorkshops.length === 0 ? (
        <div className="text-center py-5">
          <h5>No workshops found</h5>
          <p className="text-muted">
            {filter === 'upcoming' && "There are no upcoming workshops scheduled at the moment."}
            {filter === 'registered' && "You haven't registered for any workshops yet."}
            {filter === 'all' && "No workshops are currently available."}
          </p>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredWorkshops.map(workshop => (
            <Col key={workshop.id}>
              <Card className="h-100 workshop-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Badge bg="info">{workshop.category}</Badge>
                    {isRegistered(workshop) && (
                      <Badge bg="success">Registered</Badge>
                    )}
                  </div>
                  <Card.Title>{workshop.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {formatDate(workshop.startDate)} at {workshop.startTime}
                  </Card.Subtitle>
                  <div className="speaker-info mb-3">
                    <p className="mb-0">
                      <strong>Speaker:</strong> {workshop.speakerName}
                    </p>
                  </div>
                  <Card.Text className="workshop-description">
                    {workshop.shortDescription}
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="bg-white">
                  <Button 
                    variant="outline-primary" 
                    onClick={() => handleViewDetails(workshop)}
                  >
                    View Details
                  </Button>
                  <span className="ms-3 text-muted">
                    <small>
                      {workshop.registeredStudents.length}/{workshop.capacity} registered
                    </small>
                  </span>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      
      {/* Workshop Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        {selectedWorkshop && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedWorkshop.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="workshop-details">
                <div className="workshop-dates mb-4">
                  <h5>Workshop Details</h5>
                  <p><strong>Date:</strong> {formatDate(selectedWorkshop.startDate)}</p>
                  <p><strong>Time:</strong> {selectedWorkshop.startTime} - {selectedWorkshop.endTime}</p>
                  <p><strong>Location:</strong> {selectedWorkshop.location}</p>
                  <p>
                    <strong>Registration:</strong> {selectedWorkshop.registeredStudents.length}/{selectedWorkshop.capacity} spots filled
                  </p>
                </div>

                <div className="workshop-description mb-4">
                  <h5>Description</h5>
                  <p>{selectedWorkshop.shortDescription}</p>
                </div>
                
                <div className="mb-4">
                  <h5>About the Speaker</h5>
                  <h6>{selectedWorkshop.speakerName}</h6>
                  <p>{selectedWorkshop.speakerBio}</p>
                </div>
                
                <div className="workshop-agenda">
                  <h5>Workshop Agenda</h5>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedWorkshop.agenda.map((item, index) => (
                        <tr key={index}>
                          <td>{item.time}</td>
                          <td>{item.activity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <Form onSubmit={handleRegister} className="mt-4">
                  {!isRegistered(selectedWorkshop) && (
                    <Form.Group className="mb-3" controlId="registrationNote">
                      <Form.Label>Registration Note (Optional)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={registrationNote}
                        onChange={(e) => setRegistrationNote(e.target.value)}
                        placeholder="Any questions or special requirements?"
                      />
                    </Form.Group>
                  )}
                  
                  <div className="d-flex justify-content-end">
                    <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>
                      Close
                    </Button>
                    
                    {isWorkshopUpcoming(selectedWorkshop) && (
                      <Button 
                        variant={isRegistered(selectedWorkshop) ? "outline-danger" : "success"} 
                        type="submit" 
                        disabled={!isRegistered(selectedWorkshop) && selectedWorkshop.registeredStudents.length >= selectedWorkshop.capacity}
                      >
                        {isRegistered(selectedWorkshop) 
                          ? "Cancel Registration" 
                          : selectedWorkshop.registeredStudents.length >= selectedWorkshop.capacity 
                            ? "Workshop Full" 
                            : "Register for Workshop"
                        }
                      </Button>
                    )}
                  </div>
                </Form>
              </div>
            </Modal.Body>
          </>
        )}
      </Modal>
    </div>
  );
};

export default WorkshopList;