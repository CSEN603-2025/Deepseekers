import React, { useState, useEffect } from "react";
import Profile from "../components/Profile";
import LogoutButton from "../components/LogoutButton";
import PostInternship from "../components/PostInternship";
import { Card, Badge, Button, Tabs, Tab, Form, InputGroup, Accordion, Row, Col, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../css/CompanyDashBoard.css";
import { companies } from '../Data/UserData';

function CompanyDashBoard() {
    const [postedInternships, setPostedInternships] = useState([]);
    const [allInternships, setAllInternships] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState("all-internships");
    const navigate = useNavigate();
    
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPaid, setFilterPaid] = useState(false);
    const [filterUnpaid, setFilterUnpaid] = useState(false);
    const [selectedIndustries, setSelectedIndustries] = useState([]);
    const [durationFilter, setDurationFilter] = useState('all');
    const [activeFilters, setActiveFilters] = useState(0);
    
    // Get unique list of industries from companies data
    const industries = [...new Set(companies.map(company => company.industry))];
    
    // Duration options for filtering
    const durationOptions = [
        { value: 'all', label: 'All Durations' },
        { value: 'short', label: 'Short Term (< 3 months)' },
        { value: 'medium', label: 'Medium Term (3-6 months)' },
        { value: 'long', label: 'Long Term (> 6 months)' }
    ];
    
    // Load company data and posted internships from localStorage
    useEffect(() => {
        // Get user data
        const userData = localStorage.getItem('currentUser');
        
        if (userData) {
            setCurrentUser(JSON.parse(userData));
        } else {
            // Redirect to login if no user data is found
            navigate('/');
        }
        
        // Get all internships data
        const allInternshipsData = JSON.parse(localStorage.getItem('postedInternships')) || [];
        setAllInternships(enrichInternshipsWithIndustry(allInternshipsData));
        
        // Filter only the company's internships
        if (userData) {
            const user = JSON.parse(userData);
            const companyInternships = allInternshipsData.filter(
                internship => internship.companyId === user.id || internship.companyName === user.name
            );
            setPostedInternships(enrichInternshipsWithIndustry(companyInternships));
        }
    }, [navigate]);
    
    // Enrich internships with company industry data
    const enrichInternshipsWithIndustry = (internships) => {
        return internships.map(internship => {
            const company = companies.find(c => c.id === internship.companyId || c.name === internship.companyName);
            return {
                ...internship,
                industry: company ? company.industry : 'Unknown'
            };
        });
    };
    
    // Listen for changes to localStorage
    useEffect(() => {
        const handleStorageChange = () => {
            const allInternshipsData = JSON.parse(localStorage.getItem('postedInternships')) || [];
            setAllInternships(enrichInternshipsWithIndustry(allInternshipsData));
            
            if (currentUser) {
                const companyInternships = allInternshipsData.filter(
                    internship => internship.companyId === currentUser.id || internship.companyName === currentUser.name
                );
                setPostedInternships(enrichInternshipsWithIndustry(companyInternships));
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [currentUser]);
    
    // Calculate active filters count
    useEffect(() => {
        let count = 0;
        if (filterPaid || filterUnpaid) count++;
        if (selectedIndustries.length > 0) count++;
        if (durationFilter !== 'all') count++;
        setActiveFilters(count);
    }, [filterPaid, filterUnpaid, selectedIndustries, durationFilter]);
    
    // Helper function to parse duration string into months
    const parseDuration = (durationString) => {
        if (!durationString) return 0;
        
        try {
            // Convert to lowercase for case-insensitive matching
            const duration = durationString.toLowerCase();
            
            // Check for common duration patterns
            let totalMonths = 0;
            
            // Look for months
            const monthsPattern = /(\d+)\s*(month|months|mo)/i;
            const monthsMatch = duration.match(monthsPattern);
            if (monthsMatch && monthsMatch[1]) {
                totalMonths += parseInt(monthsMatch[1], 10) || 0;
            }
            
            // Look for weeks
            const weeksPattern = /(\d+)\s*(week|weeks|wk)/i;
            const weeksMatch = duration.match(weeksPattern);
            if (weeksMatch && weeksMatch[1]) {
                totalMonths += (parseInt(weeksMatch[1], 10) || 0) / 4;
            }
            
            // Look for years
            const yearsPattern = /(\d+)\s*(year|years|yr)/i;
            const yearsMatch = duration.match(yearsPattern);
            if (yearsMatch && yearsMatch[1]) {
                totalMonths += (parseInt(yearsMatch[1], 10) || 0) * 12;
            }
            
            // Handle cases like "Summer 2025" or other text-based descriptions
            if (totalMonths === 0) {
                // If contains "summer", assume 3 months
                if (duration.includes('summer')) {
                    totalMonths = 3;
                }
                // If contains "semester", assume 4 months
                else if (duration.includes('semester')) {
                    totalMonths = 4;
                }
                // If a simple number is provided (like "3")
                else {
                    const simpleNumber = /^(\d+)$/;
                    const numberMatch = duration.match(simpleNumber);
                    if (numberMatch && numberMatch[1]) {
                        totalMonths = parseInt(numberMatch[1], 10) || 0;
                    }
                }
            }
            
            return totalMonths;
        } catch (error) {
            console.error("Error parsing duration:", error);
            return 0; // Return 0 as a fallback instead of crashing
        }
    };
    
    // Handle industry selection
    const handleIndustryChange = (industry) => {
        if (selectedIndustries.includes(industry)) {
            setSelectedIndustries(selectedIndustries.filter(i => i !== industry));
        } else {
            setSelectedIndustries([...selectedIndustries, industry]);
        }
    };
    
    // Clear all filters
    const clearFilters = () => {
        setFilterPaid(false);
        setFilterUnpaid(false);
        setSelectedIndustries([]);
        setDurationFilter('all');
        setSearchTerm('');
    };
    
    // Apply filters to internships
    const applyFilters = (internships) => {
        return internships.filter(internship => {
            // Match search term
            const matchesSearch = searchTerm === '' || 
                internship.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                internship.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
                
            // Match paid/unpaid filter
            let matchesPaymentFilter = true;
            if (filterPaid && !filterUnpaid) {
                matchesPaymentFilter = internship.paid === true;
            } else if (!filterPaid && filterUnpaid) {
                matchesPaymentFilter = internship.paid === false;
            } else if (filterPaid && filterUnpaid) {
                matchesPaymentFilter = true; // Show both if both filters are active
            }
            
            // Match industry filter
            const matchesIndustryFilter = selectedIndustries.length === 0 || 
                selectedIndustries.includes(internship.industry);
                
            // Match duration filter
            let matchesDurationFilter = true;
            if (durationFilter !== 'all' && internship.duration) {
                const durationInMonths = parseDuration(internship.duration);
                
                if (durationFilter === 'short') {
                    matchesDurationFilter = durationInMonths < 3;
                } else if (durationFilter === 'medium') {
                    matchesDurationFilter = durationInMonths >= 3 && durationInMonths <= 6;
                } else if (durationFilter === 'long') {
                    matchesDurationFilter = durationInMonths > 6;
                }
            }
            
            return matchesSearch && matchesPaymentFilter && matchesIndustryFilter && matchesDurationFilter;
        });
    };
    
    const filteredCompanyInternships = applyFilters(postedInternships);
    const filteredAllInternships = applyFilters(allInternships);
    
    if (!currentUser) {
        return <div>Loading profile...</div>;
    }
    
    return (
        <div className="company-dashboard">
            <div className="logout-container" style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}>
                <LogoutButton />
            </div>
            <Profile name={currentUser.name} navigateTo="/company/edit-profile" showEditButton={false} />
            
            <Container className="dashboard-container">
                <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className="mb-4 dashboard-tabs"
                >
                    <Tab eventKey="all-internships" title="All Internships">
                        <div className="tab-content-container">
                            <Row className="mb-4">
                                <Col>
                                    <InputGroup>
                                        <InputGroup.Text id="search-addon-all">
                                            <i className="bi bi-search"></i>
                                        </InputGroup.Text>
                                        <Form.Control
                                            placeholder="Search by job title or company name"
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            value={searchTerm}
                                        />
                                    </InputGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={3}>
                                    <div className="filter-options mb-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h5 className="filter-section-title m-0">
                                                Filters
                                                {activeFilters > 0 && (
                                                    <Badge className="ms-2 filter-count-badge">{activeFilters}</Badge>
                                                )}
                                            </h5>
                                            
                                            {activeFilters > 0 && (
                                                <Button 
                                                    variant="link" 
                                                    className="p-0 text-decoration-none clear-filters-btn"
                                                    onClick={clearFilters}
                                                >
                                                    Clear all
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <Accordion defaultActiveKey="0" className="filter-accordion">
                                        {/* Payment Type Filter */}
                                        <Accordion.Item eventKey="0">
                                            <Accordion.Header>Payment Type</Accordion.Header>
                                            <Accordion.Body>
                                                <Form.Check 
                                                    type="checkbox"
                                                    id="paid-filter-all"
                                                    label="Paid"
                                                    checked={filterPaid}
                                                    onChange={(e) => setFilterPaid(e.target.checked)}
                                                    className="mb-2"
                                                />
                                                <Form.Check 
                                                    type="checkbox"
                                                    id="unpaid-filter-all"
                                                    label="Unpaid"
                                                    checked={filterUnpaid}
                                                    onChange={(e) => setFilterUnpaid(e.target.checked)}
                                                />
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        
                                        {/* Industry Filter */}
                                        <Accordion.Item eventKey="1">
                                            <Accordion.Header>Industry</Accordion.Header>
                                            <Accordion.Body className="industry-filters">
                                                {industries.map(industry => (
                                                    <Form.Check 
                                                        key={industry}
                                                        type="checkbox"
                                                        id={`industry-${industry}-all`}
                                                        label={industry}
                                                        checked={selectedIndustries.includes(industry)}
                                                        onChange={() => handleIndustryChange(industry)}
                                                        className="mb-2"
                                                    />
                                                ))}
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        
                                        {/* Duration Filter */}
                                        <Accordion.Item eventKey="2">
                                            <Accordion.Header>Duration</Accordion.Header>
                                            <Accordion.Body>
                                                <Form.Select 
                                                    value={durationFilter}
                                                    onChange={(e) => setDurationFilter(e.target.value)}
                                                >
                                                    {durationOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    </Accordion>
                                </Col>
                                
                                <Col md={9}>
                                    <div className="results-summary mb-3">
                                        <p className="results-count">
                                            Showing {filteredAllInternships.length} internship{filteredAllInternships.length !== 1 ? 's' : ''}
                                            {activeFilters > 0 && ' with applied filters'}
                                        </p>
                                    </div>
                                    
                                    <div className="internships-grid">
                                        {filteredAllInternships.map((internship) => (
                                            <Card key={internship.id} className="internship-card">
                                                <Card.Header>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <h5 className="card-title">{internship.title}</h5>
                                                        <Badge bg={internship.paid ? "success" : "secondary"}>
                                                            {internship.paid ? "Paid" : "Unpaid"}
                                                        </Badge>
                                                    </div>
                                                </Card.Header>
                                                <Card.Body>
                                                    <p className="company-name">{internship.companyName}</p>
                                                    {internship.department && (
                                                        <p><strong>Department:</strong> {internship.department}</p>
                                                    )}
                                                    <p className="internship-description">{internship.description.substring(0, 150)}...</p>
                                                    <div className="internship-details">
                                                        {internship.location && (
                                                            <span><i className="bi bi-geo-alt"></i> {internship.location}</span>
                                                        )}
                                                        {internship.duration && (
                                                            <span><i className="bi bi-clock"></i> {internship.duration}</span>
                                                        )}
                                                    </div>
                                                    {internship.deadline && (
                                                        <p className="internship-deadline">
                                                            <strong>Deadline:</strong> {new Date(internship.deadline).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </Card.Body>
                                                <Card.Footer>
                                                    <Button variant="outline-primary" size="sm" className="w-100">View Details</Button>
                                                </Card.Footer>
                                            </Card>
                                        ))}
                                    </div>
                                    
                                    {filteredAllInternships.length === 0 && (
                                        <div className="no-results-container">
                                            <h5>No internships found</h5>
                                            <p className="text-muted">
                                                {allInternships.length === 0 
                                                    ? "No internships have been posted yet." 
                                                    : "No internships match your search criteria. Try adjusting your filters."}
                                            </p>
                                            {activeFilters > 0 && (
                                                <Button 
                                                    variant="outline-primary" 
                                                    onClick={clearFilters}
                                                    className="mt-3"
                                                >
                                                    Clear all filters
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </div>
                    </Tab>
                    <Tab eventKey="your-internships" title="My Internships">
                        <div className="tab-content-container">
                            {postedInternships.length > 0 ? (
                                <>
                                    <Row className="mb-4">
                                        <Col>
                                            <InputGroup>
                                                <InputGroup.Text id="search-addon">
                                                    <i className="bi bi-search"></i>
                                                </InputGroup.Text>
                                                <Form.Control
                                                    placeholder="Search by job title"
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    value={searchTerm}
                                                />
                                            </InputGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={3}>
                                            <div className="filter-options mb-3">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <h5 className="filter-section-title m-0">
                                                        Filters
                                                        {activeFilters > 0 && (
                                                            <Badge className="ms-2 filter-count-badge">{activeFilters}</Badge>
                                                        )}
                                                    </h5>
                                                
                                                    {activeFilters > 0 && (
                                                        <Button 
                                                            variant="link" 
                                                            className="p-0 text-decoration-none clear-filters-btn"
                                                            onClick={clearFilters}
                                                        >
                                                            Clear all
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            <Accordion defaultActiveKey="0" className="filter-accordion">
                                                {/* Payment Type Filter */}
                                                <Accordion.Item eventKey="0">
                                                    <Accordion.Header>Payment Type</Accordion.Header>
                                                    <Accordion.Body>
                                                        <Form.Check 
                                                            type="checkbox"
                                                            id="paid-filter-company"
                                                            label="Paid"
                                                            checked={filterPaid}
                                                            onChange={(e) => setFilterPaid(e.target.checked)}
                                                            className="mb-2"
                                                        />
                                                        <Form.Check 
                                                            type="checkbox"
                                                            id="unpaid-filter-company"
                                                            label="Unpaid"
                                                            checked={filterUnpaid}
                                                            onChange={(e) => setFilterUnpaid(e.target.checked)}
                                                        />
                                                    </Accordion.Body>
                                                </Accordion.Item>
                                                
                                                {/* Industry Filter */}
                                                <Accordion.Item eventKey="1">
                                                    <Accordion.Header>Industry</Accordion.Header>
                                                    <Accordion.Body className="industry-filters">
                                                        {industries.map(industry => (
                                                            <Form.Check 
                                                                key={industry}
                                                                type="checkbox"
                                                                id={`industry-${industry}-company`}
                                                                label={industry}
                                                                checked={selectedIndustries.includes(industry)}
                                                                onChange={() => handleIndustryChange(industry)}
                                                                className="mb-2"
                                                            />
                                                        ))}
                                                    </Accordion.Body>
                                                </Accordion.Item>
                                                
                                                {/* Duration Filter */}
                                                <Accordion.Item eventKey="2">
                                                    <Accordion.Header>Duration</Accordion.Header>
                                                    <Accordion.Body>
                                                        <Form.Select 
                                                            value={durationFilter}
                                                            onChange={(e) => setDurationFilter(e.target.value)}
                                                        >
                                                            {durationOptions.map(option => (
                                                                <option key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </option>
                                                            ))}
                                                        </Form.Select>
                                                    </Accordion.Body>
                                                </Accordion.Item>
                                            </Accordion>
                                        </Col>
                                        
                                        <Col md={9}>
                                            <div className="results-summary mb-3">
                                                <p className="results-count">
                                                    Showing {filteredCompanyInternships.length} internship{filteredCompanyInternships.length !== 1 ? 's' : ''}
                                                    {activeFilters > 0 && ' with applied filters'}
                                                </p>
                                            </div>
                                            
                                            <div className="internships-grid">
                                                {filteredCompanyInternships.map((internship) => (
                                                    <Card key={internship.id} className="internship-card">
                                                        <Card.Header>
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <h5 className="card-title">{internship.title}</h5>
                                                                <Badge bg={internship.paid ? "success" : "secondary"}>
                                                                    {internship.paid ? "Paid" : "Unpaid"}
                                                                </Badge>
                                                            </div>
                                                        </Card.Header>
                                                        <Card.Body>
                                                            {internship.department && (
                                                                <p><strong>Department:</strong> {internship.department}</p>
                                                            )}
                                                            <p className="internship-description">{internship.description.substring(0, 150)}...</p>
                                                            <div className="internship-details">
                                                                {internship.location && (
                                                                    <span><i className="bi bi-geo-alt"></i> {internship.location}</span>
                                                                )}
                                                                {internship.duration && (
                                                                    <span><i className="bi bi-clock"></i> {internship.duration}</span>
                                                                )}
                                                            </div>
                                                            {internship.deadline && (
                                                                <p className="internship-deadline">
                                                                    <strong>Deadline:</strong> {new Date(internship.deadline).toLocaleDateString()}
                                                                </p>
                                                            )}
                                                        </Card.Body>
                                                        <Card.Footer>
                                                            <div className="d-flex justify-content-between">
                                                                <Button variant="outline-primary" size="sm">Edit</Button>
                                                                <Button variant="outline-danger" size="sm">Remove</Button>
                                                            </div>
                                                        </Card.Footer>
                                                    </Card>
                                                ))}
                                            </div>
                                            
                                            {filteredCompanyInternships.length === 0 && (
                                                <div className="no-results-container">
                                                    <h5>No internships found</h5>
                                                    <p className="text-muted">
                                                        {postedInternships.length === 0 
                                                            ? "You haven't posted any internships yet." 
                                                            : "No internships match your search criteria. Try adjusting your filters."}
                                                    </p>
                                                    {activeFilters > 0 && (
                                                        <Button 
                                                            variant="outline-primary" 
                                                            onClick={clearFilters}
                                                            className="mt-3"
                                                        >
                                                            Clear all filters
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </Col>
                                    </Row>
                                </>
                            ) : (
                                <div className="no-internships-container">
                                    <h4>You haven't posted any internships yet</h4>
                                    <p>Switch to the "Post New Internship" tab to create your first internship listing</p>
                                    <Button 
                                        variant="primary" 
                                        onClick={() => setActiveTab("post-new")}
                                        className="mt-3"
                                    >
                                        Post New Internship
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Tab>
                    <Tab eventKey="post-new" title="Post New Internship">
                        
                            <PostInternship />
                       
                    </Tab>
                </Tabs>
            </Container>
        </div>
    );
}
    
export default CompanyDashBoard;