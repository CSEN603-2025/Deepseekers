import React, { useState, useEffect } from 'react';
import ScadNavigationBar from '../components/ScadNavigationBar';
import Post from '../components/Post';
import { Container, Row, Col, Form, InputGroup, Dropdown } from 'react-bootstrap';
import '../css/scadHome.css';


export default function ScadHomePage() {
    const [internships, setInternships] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');

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
    
    // Filter and sort internships
    const filteredAndSortedInternships = internships
        .filter(internship => 
            searchTerm === '' || 
            internship.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (internship.description && internship.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (internship.department && internship.department.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.date) - new Date(a.date);
            } else if (sortBy === 'deadline') {
                // Sort by deadline (closest first)
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return new Date(a.deadline) - new Date(b.deadline);
            } else if (sortBy === 'department') {
                // Sort alphabetically by department
                if (!a.department) return 1;
                if (!b.department) return -1;
                return a.department.localeCompare(b.department);
            }
            return 0;
        });

    return (
        <div className="scad-home-page">
         
            <Container className="scad-internships-container mt-4">
                <Row className="mb-4">
                    <Col>
                        <h2 className="page-title">Internship Listings</h2>
                        <p className="text-muted">Monitor all internships posted by partner companies</p>
                    </Col>
                </Row>
                
                <Row className="mb-4">
                    <Col md={8}>
                        <InputGroup>
                            <InputGroup.Text id="search-addon">
                                <i className="bi bi-search"></i>
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Search internships"
                                onChange={(e) => setSearchTerm(e.target.value)}
                                value={searchTerm}
                            />
                        </InputGroup>
                    </Col>
                    <Col md={4}>
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" id="dropdown-sort" className="w-100">
                                Sort by: {sortBy === 'newest' ? 'Newest' : sortBy === 'deadline' ? 'Application Deadline' : 'Department'}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => setSortBy('newest')}>Newest</Dropdown.Item>
                                <Dropdown.Item onClick={() => setSortBy('deadline')}>Application Deadline</Dropdown.Item>
                                <Dropdown.Item onClick={() => setSortBy('department')}>Department</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                </Row>
                
                {filteredAndSortedInternships.length > 0 ? (
                    <Row>
                        <Col>
                            {filteredAndSortedInternships.map((internship) => (
                                <Post 
                                    key={internship.id} 
                                    internship={internship} 
                                    isStudent={false} // SCAD admin view
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
                                    ? "No internships have been posted by companies yet." 
                                    : "No internships match your search criteria."}
                            </p>
                        </Col>
                    </Row>
                )}
            </Container>
        </div>
    );

}



