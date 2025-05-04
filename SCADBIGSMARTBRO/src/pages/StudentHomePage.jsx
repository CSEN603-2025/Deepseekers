// /pages/StudentHomePage.jsx
import React, { useState, useEffect } from 'react';
import NavigationBar from '../components/NavigationBar';
import Post from '../components/Post';
import { Container, Row, Col, Form, InputGroup } from 'react-bootstrap';
import '../css/studentHome.css';

const StudentHomePage = () => {
  const [internships, setInternships] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPaid, setFilterPaid] = useState(false);

  // Load internships from localStorage
  useEffect(() => {
    const loadInternships = () => {
      const storedInternships = JSON.parse(localStorage.getItem('postedInternships')) || [];
      setInternships(storedInternships);
    };
    
    loadInternships();
    
    // Add an event listener to handle updates to localStorage
    window.addEventListener('storage', loadInternships);
    
    return () => {
      window.removeEventListener('storage', loadInternships);
    };
  }, []);
  
  // Filter internships based on search term and paid filter
  const filteredInternships = internships.filter(internship => {
    const matchesSearch = searchTerm === '' || 
      internship.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (internship.description && internship.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (internship.department && internship.department.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesPaidFilter = !filterPaid || (filterPaid && internship.paid);
    
    return matchesSearch && matchesPaidFilter;
  });

  return (    
    <div className="student-home">
      <Container className="internships-container mt-4">
        <Row className="mb-4">
          <Col>
            <h2 className="page-title">Available Internships</h2>
            <p className="text-muted">Find and apply for internships that match your skills and interests</p>
          </Col>
        </Row>
        
        <Row className="mb-4">
          <Col md={8}>
            <InputGroup>
              <InputGroup.Text id="search-addon">
                <i className="bi bi-search"></i>
              </InputGroup.Text>
              <Form.Control
                placeholder="Search by title, department, or keywords"
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
              />
            </InputGroup>
          </Col>
          <Col md={4}>
            <Form.Check 
              type="switch"
              id="paid-only-switch"
              label="Show paid internships only"
              checked={filterPaid}
              onChange={(e) => setFilterPaid(e.target.checked)}
            />
          </Col>
        </Row>
        
        {filteredInternships.length > 0 ? (
          <Row>
            <Col>
              {filteredInternships.map((internship) => (
                <Post 
                  key={internship.id} 
                  internship={internship} 
                  isStudent={true} 
                />
              ))}
            </Col>
          </Row>
        ) : (
          <Row>
            <Col className="text-center py-5">
              <h5>No internships found</h5>
              <p className="text-muted">
                {internships.length === 0 
                  ? "No internships have been posted yet. Check back later!" 
                  : "No internships match your search criteria. Try adjusting your filters."}
              </p>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default StudentHomePage;
