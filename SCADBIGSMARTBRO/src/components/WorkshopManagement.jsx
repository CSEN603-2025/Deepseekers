import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import { workshops as initialWorkshops } from '../Data/WorkshopsData';
import '../css/WorkshopManagement.css';

const WorkshopManagement = () => {
  const [workshops, setWorkshops] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState(null);
  const [validated, setValidated] = useState(false);
  
  // Load workshops from localStorage on component mount
  useEffect(() => {
    try {
      const storedWorkshops = JSON.parse(localStorage.getItem('workshops'));
      if (storedWorkshops && Array.isArray(storedWorkshops)) {
        setWorkshops(storedWorkshops);
      } else {
        // If no workshops in localStorage or data is invalid, use initial data
        setWorkshops(initialWorkshops);
        localStorage.setItem('workshops', JSON.stringify(initialWorkshops));
      }
    } catch (error) {
      console.error("Error loading workshops:", error);
      setWorkshops(initialWorkshops);
      localStorage.setItem('workshops', JSON.stringify(initialWorkshops));
    }
  }, []);
  
  // Initialize a new workshop
  const handleAddWorkshop = () => {
    const newWorkshop = {
      id: Date.now(), // Use timestamp for unique ID
      title: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      shortDescription: '',
      speakerName: '',
      speakerBio: '',
      agenda: [{ time: '', activity: '' }],
      capacity: 30,
      registeredStudents: [],
      location: 'Online via Zoom',
      category: 'Career Development'
    };
    
    setEditingWorkshop(newWorkshop);
    setValidated(false);
    setShowModal(true);
  };
  
  const handleEditWorkshop = (workshop) => {
    // Create a deep copy to avoid modifying the original
    setEditingWorkshop(JSON.parse(JSON.stringify(workshop)));
    setValidated(false);
    setShowModal(true);
  };
  
  const handleDeleteWorkshop = (id) => {
    if (window.confirm('Are you sure you want to delete this workshop?')) {
      const updatedWorkshops = workshops.filter(w => w.id !== id);
      setWorkshops(updatedWorkshops);
      localStorage.setItem('workshops', JSON.stringify(updatedWorkshops));
    }
  };
  
  const handleAddAgendaItem = () => {
    setEditingWorkshop({
      ...editingWorkshop,
      agenda: [...editingWorkshop.agenda, { time: '', activity: '' }]
    });
  };
  
  const handleRemoveAgendaItem = (index) => {
    const newAgenda = [...editingWorkshop.agenda];
    newAgenda.splice(index, 1);
    setEditingWorkshop({
      ...editingWorkshop,
      agenda: newAgenda
    });
  };
  
  const handleAgendaChange = (index, field, value) => {
    const newAgenda = [...editingWorkshop.agenda];
    newAgenda[index][field] = value;
    setEditingWorkshop({
      ...editingWorkshop,
      agenda: newAgenda
    });
  };
  
  const handleInputChange = (field, value) => {
    setEditingWorkshop({
      ...editingWorkshop,
      [field]: value
    });
  };
  
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }
    
    // Check if we're adding a new workshop or updating an existing one
    const isNewWorkshop = !workshops.some(w => w.id === editingWorkshop.id);
    
    let updatedWorkshops;
    if (isNewWorkshop) {
      // Add new workshop
      updatedWorkshops = [...workshops, editingWorkshop];
    } else {
      // Update existing workshop
      updatedWorkshops = workshops.map(w => 
        w.id === editingWorkshop.id ? editingWorkshop : w
      );
    }
    
    // Update state and localStorage
    setWorkshops(updatedWorkshops);
    
    try {
      localStorage.setItem('workshops', JSON.stringify(updatedWorkshops));
      console.log("Workshops saved:", updatedWorkshops);
    } catch (error) {
      console.error("Error saving workshops to localStorage:", error);
    }
    
    setShowModal(false);
  };
  
  const formatDateTime = (date, time) => {
    if (!date) return "Date not set";
    try {
      return `${new Date(date).toLocaleDateString()} at ${time || "time not set"}`;
    } catch (e) {
      return "Invalid date";
    }
  };
  
  return (
    <div className="workshop-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Career Workshops Management</h3>
        <Button variant="primary" onClick={handleAddWorkshop}>
          <i className="bi bi-plus-circle me-2"></i>Add New Workshop
        </Button>
      </div>
      
      {workshops.length === 0 ? (
        <div className="text-center py-5">
          <h5>No Workshops Available</h5>
          <p>Create your first workshop by clicking the Add New Workshop button.</p>
        </div>
      ) : (
        <Table responsive striped bordered hover className="workshop-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date & Time</th>
              <th>Speaker</th>
              <th>Registrations</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {workshops.map(workshop => (
              <tr key={workshop.id}>
                <td>
                  {workshop.title}
                  <Badge bg="info" className="ms-2">{workshop.category}</Badge>
                </td>
                <td>{formatDateTime(workshop.startDate, workshop.startTime)}</td>
                <td>{workshop.speakerName}</td>
                <td>
                  <Badge bg={workshop.registeredStudents && workshop.registeredStudents.length >= workshop.capacity ? "danger" : "success"}>
                    {(workshop.registeredStudents?.length || 0)}/{workshop.capacity}
                  </Badge>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleEditWorkshop(workshop)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDeleteWorkshop(workshop.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingWorkshop && workshops.some(w => w.id === editingWorkshop.id) 
              ? 'Edit Workshop' 
              : 'Add New Workshop'
            }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Form.Group as={Col} md="8" controlId="title">
                <Form.Label>Workshop Title</Form.Label>
                <Form.Control
                  required
                  type="text"
                  value={editingWorkshop?.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a workshop title.
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group as={Col} md="4" controlId="category">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={editingWorkshop?.category || ''}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  <option value="Career Development">Career Development</option>
                  <option value="Technical Skills">Technical Skills</option>
                  <option value="Soft Skills">Soft Skills</option>
                  <option value="Industry Insights">Industry Insights</option>
                </Form.Select>
              </Form.Group>
            </Row>
            
            <Row className="mb-3">
              <Form.Group as={Col} md="3" controlId="startDate">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  required
                  type="date"
                  value={editingWorkshop?.startDate || ''}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </Form.Group>
              
              <Form.Group as={Col} md="3" controlId="startTime">
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  required
                  type="time"
                  value={editingWorkshop?.startTime || ''}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                />
              </Form.Group>
              
              <Form.Group as={Col} md="3" controlId="endDate">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  required
                  type="date"
                  value={editingWorkshop?.endDate || ''}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </Form.Group>
              
              <Form.Group as={Col} md="3" controlId="endTime">
                <Form.Label>End Time</Form.Label>
                <Form.Control
                  required
                  type="time"
                  value={editingWorkshop?.endTime || ''}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                />
              </Form.Group>
            </Row>
            
            <Form.Group className="mb-3" controlId="shortDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                required
                as="textarea"
                rows={3}
                value={editingWorkshop?.shortDescription || ''}
                onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              />
            </Form.Group>
            
            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="speakerName">
                <Form.Label>Speaker Name</Form.Label>
                <Form.Control
                  required
                  type="text"
                  value={editingWorkshop?.speakerName || ''}
                  onChange={(e) => handleInputChange('speakerName', e.target.value)}
                />
              </Form.Group>
            </Row>
            
            <Form.Group className="mb-3" controlId="speakerBio">
              <Form.Label>Speaker Biography</Form.Label>
              <Form.Control
                required
                as="textarea"
                rows={3}
                value={editingWorkshop?.speakerBio || ''}
                onChange={(e) => handleInputChange('speakerBio', e.target.value)}
              />
            </Form.Group>
            
            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="capacity">
                <Form.Label>Workshop Capacity</Form.Label>
                <Form.Control
                  required
                  type="number"
                  min="1"
                  value={editingWorkshop?.capacity || ''}
                  onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 1)}
                />
              </Form.Group>
              
              <Form.Group as={Col} md="6" controlId="location">
                <Form.Label>Location/Platform</Form.Label>
                <Form.Control
                  required
                  type="text"
                  value={editingWorkshop?.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </Form.Group>
            </Row>
            
            <h5 className="mt-4 mb-3">Workshop Agenda</h5>
            
            {editingWorkshop?.agenda?.map((item, index) => (
              <Row key={index} className="mb-3 align-items-center">
                <Form.Group as={Col} md="4" controlId={`time-${index}`}>
                  <Form.Label className={index > 0 ? "visually-hidden" : ""}>Time</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="e.g. 14:00 - 14:30"
                    value={item.time}
                    onChange={(e) => handleAgendaChange(index, 'time', e.target.value)}
                  />
                </Form.Group>
                
                <Form.Group as={Col} md="7" controlId={`activity-${index}`}>
                  <Form.Label className={index > 0 ? "visually-hidden" : ""}>Activity</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Activity description"
                    value={item.activity}
                    onChange={(e) => handleAgendaChange(index, 'activity', e.target.value)}
                  />
                </Form.Group>
                
                <Col md="1" className="d-flex align-items-end justify-content-center">
                  {index > 0 && (
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={() => handleRemoveAgendaItem(index)}
                      aria-label="Remove agenda item"
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  )}
                </Col>
              </Row>
            ))}
            
            <div className="mb-4">
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={handleAddAgendaItem}
              >
                <i className="bi bi-plus"></i> Add Agenda Item
              </Button>
            </div>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingWorkshop && workshops.some(w => w.id === editingWorkshop.id) ? 'Update Workshop' : 'Create Workshop'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default WorkshopManagement;