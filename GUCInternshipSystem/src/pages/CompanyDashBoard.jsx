import React, { useState, useEffect } from "react";
import Profile from "../components/Profile";
import LogoutButton from "../components/LogoutButton";
import PostInternship from "../components/PostInternship";
import { Card, Badge, Button } from "react-bootstrap";

function CompanyDashBoard() {
    const [postedInternships, setPostedInternships] = useState([]);
    
    // Load posted internships from localStorage
    useEffect(() => {
        const internships = JSON.parse(localStorage.getItem('postedInternships')) || [];
        setPostedInternships(internships);
    }, []);
    
    // Listen for changes to localStorage
    useEffect(() => {
        const handleStorageChange = () => {
            const internships = JSON.parse(localStorage.getItem('postedInternships')) || [];
            setPostedInternships(internships);
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);
    
    return (
        <div>
            <div className="logout-container" style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}>
                <LogoutButton />
            </div>
            <Profile name="Company Name" navigateTo="/company/edit-profile" showEditButton={false} />
            
            {/* Post Internship Component */}
            <div style={{ marginTop: '-50px' }}>
                <PostInternship />
            </div>
            
            {/* Display Posted Internships */}
            {postedInternships.length > 0 && (
                <div className="posted-internships" style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '2px solid #e9ecef', paddingBottom: '0.5rem' }}>
                        Your Posted Internships
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {postedInternships.map((internship) => (
                            <Card key={internship.id} style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', border: 'none' }}>
                                <Card.Header style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h5 style={{ margin: 0 }}>{internship.title}</h5>
                                        <Badge bg="success">Active</Badge>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    {internship.department && (
                                        <p><strong>Department:</strong> {internship.department}</p>
                                    )}
                                    <p style={{ marginBottom: '0.5rem' }}>{internship.description.substring(0, 150)}...</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                                        {internship.location && (
                                            <span><i className="bi bi-geo-alt"></i> {internship.location}</span>
                                        )}
                                        {internship.duration && (
                                            <span><i className="bi bi-clock"></i> {internship.duration}</span>
                                        )}
                                    </div>
                                    {internship.deadline && (
                                        <p style={{ marginTop: '0.5rem', color: '#dc3545' }}>
                                            <strong>Deadline:</strong> {new Date(internship.deadline).toLocaleDateString()}
                                        </p>
                                    )}
                                </Card.Body>
                                <Card.Footer style={{ backgroundColor: 'white', borderTop: '1px solid #e9ecef' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Button variant="outline-primary" size="sm">Edit</Button>
                                        <Button variant="outline-danger" size="sm">Remove</Button>
                                    </div>
                                </Card.Footer>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CompanyDashBoard;