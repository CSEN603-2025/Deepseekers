import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import '../css/PostInternship.css';

function PostInternship() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        location: '',
        duration: '',
        paid: false,
        salary: '',
        deadline: '',
        startDate: '',
        department: '',
        applicantsCount: 0 // Adding applicantsCount field initialized to 0
    });

    // Always show form
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.title || !formData.description || !formData.requirements) {
            setError('Please fill in all required fields');
            return;
        }

        // Get current company user from localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const companyName = currentUser && currentUser.name ? currentUser.name : 'Unknown Company';
        const companyId = currentUser && currentUser.id ? currentUser.id : null;

        // In a real app, you would send this data to a server
        console.log('Internship posted:', formData);
        
        // Store in localStorage for demo purposes
        const internships = JSON.parse(localStorage.getItem('postedInternships')) || [];
        internships.push({
            ...formData,
            id: Date.now(),
            date: new Date().toISOString(),
            status: 'active',
            companyName: companyName,
            companyId: companyId,
            applicantsCount: 0, // Ensure applicantsCount is set to 0 for new postings
            applications: [] // Array to store applications for this internship
        });
        localStorage.setItem('postedInternships', JSON.stringify(internships));
        
        // Reset form and show success message
        setFormData({
            title: '',
            description: '',
            requirements: '',
            location: '',
            duration: '',
            paid: false,
            salary: '',
            deadline: '',
            startDate: '',
            department: '',
            applicantsCount: 0 // Reset applicantsCount too
        });
        setSubmitted(true);
        setError('');
        
        // Hide form after submission
        setTimeout(() => {
            setShowForm(false);
            setSubmitted(false);
        }, 2000);
    };

    return (
        <div className="post-internship-container">
            <Card className="post-internship-form-card">
                <Card.Header className="text-center">
                    <h3>Post a New Internship</h3>
                </Card.Header>
                    <Card.Body>
                        {submitted && (
                            <Alert variant="success">
                                Internship posted successfully!
                            </Alert>
                        )}
                        
                        {error && (
                            <Alert variant="danger">
                                {error}
                            </Alert>
                        )}
                        
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Internship Title *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g., Software Engineering Intern"
                                    required
                                />
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                                <Form.Label>Department</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    placeholder="e.g., Engineering, Marketing, Finance"
                                />
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                                <Form.Label>Description *</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe the internship role and responsibilities"
                                    required
                                />
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                                <Form.Label>Requirements *</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="requirements"
                                    value={formData.requirements}
                                    onChange={handleChange}
                                    placeholder="List the skills, qualifications, and experience required"
                                    required
                                />
                            </Form.Group>
                            
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Location</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            placeholder="e.g., Remote, Cairo, Alexandria"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Duration</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="duration"
                                            value={formData.duration}
                                            onChange={handleChange}
                                            placeholder="e.g., 3 months, Summer 2025"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            
                            <Row className="mb-3">
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Check
                                            type="checkbox"
                                            label="Paid Internship"
                                            name="paid"
                                            checked={formData.paid}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={8}>
                                    {formData.paid && (
                                        <Form.Group>
                                            <Form.Label>Salary/Stipend</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="salary"
                                                value={formData.salary}
                                                onChange={handleChange}
                                                placeholder="e.g., 5000 EGP/month"
                                            />
                                        </Form.Group>
                                    )}
                                </Col>
                            </Row>
                            
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Application Deadline</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="deadline"
                                            value={formData.deadline}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Start Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            
                            <div className="d-flex justify-content-end mt-4">
                                <Button 
                                    variant="primary" 
                                    type="submit"
                                    className="post-btn"
                                >
                                    Post Internship
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
        </div>
    );
}

export default PostInternship;
