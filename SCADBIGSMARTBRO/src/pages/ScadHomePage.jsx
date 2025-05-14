
import React, { useState, useEffect } from 'react';
import Post from '../components/Post';
import AppointmentSystem from '../components/AppointmentSystem';
import WorkshopManagement from '../components/WorkshopManagement';
import { Container, Row, Col, Form, InputGroup, Button, Accordion, Badge, Tabs, Tab } from 'react-bootstrap';
import { companies } from '../Data/UserData';
import '../css/scadHome.css';

export default function ScadHomePage() {
    const [internships, setInternships] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filter states
    const [filterPaid, setFilterPaid] = useState(false);
    const [filterUnpaid, setFilterUnpaid] = useState(false);
    const [selectedIndustries, setSelectedIndustries] = useState([]);
    const [durationFilter, setDurationFilter] = useState('all');
    const [activeFilters, setActiveFilters] = useState(0);
    const [activeTab, setActiveTab] = useState('internships');
    
    // Get unique list of industries from companies data
    const industries = [...new Set(companies.map(company => company.industry))];
    
    // Duration options for filtering
    const durationOptions = [
        { value: 'all', label: 'All Durations' },
        { value: 'short', label: 'Short Term (< 3 months)' },
        { value: 'medium', label: 'Medium Term (3-6 months)' },
        { value: 'long', label: 'Long Term (> 6 months)' }
    ];
    
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

    // Load internships from localStorage
    useEffect(() => {
        const loadInternships = () => {
            const storedInternships = JSON.parse(localStorage.getItem('postedInternships')) || [];
            
            // Enrich internships with company data for filtering by industry
            const enrichedInternships = storedInternships.map(internship => {
                const company = companies.find(c => c.id === internship.companyId || c.name === internship.companyName);
                return {
                    ...internship,
                    industry: company ? company.industry : 'Unknown'
                };
            });
            
            setInternships(enrichedInternships);
        };
        
        loadInternships();
        
        // Add an event listener to handle updates to localStorage
        window.addEventListener('storage', loadInternships);
        
        return () => {
            window.removeEventListener('storage', loadInternships);
        };
    }, []);
    
    // Calculate active filters count
    useEffect(() => {
        let count = 0;
        if (filterPaid || filterUnpaid) count++;
        if (selectedIndustries.length > 0) count++;
        if (durationFilter !== 'all') count++;
        setActiveFilters(count);
    }, [filterPaid, filterUnpaid, selectedIndustries, durationFilter]);
    
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
    
    // Filter internships based on all criteria
    const filteredInternships = internships.filter(internship => {
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

    return (
        <div className="scad-home-page">
            <Container className="scad-internships-container mt-4">
                <Tabs
                    id="scad-home-tabs"
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className="mb-4"
                >
                    <Tab eventKey="internships" title="Internship Listings">
                        <Row className="mb-4">
                            <Col>
                                <h2 className="page-title">Internship Listings</h2>
                                <p className="text-muted">Monitor all internships posted by partner companies</p>
                            </Col>
                        </Row>
                        
                        <Row className="mb-4">
                            <Col>
                                <InputGroup>
                                    <InputGroup.Text id="search-addon">
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
                                                id="paid-filter"
                                                label="Paid"
                                                checked={filterPaid}
                                                onChange={(e) => setFilterPaid(e.target.checked)}
                                                className="mb-2"
                                            />
                                            <Form.Check 
                                                type="checkbox"
                                                id="unpaid-filter"
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
                                                    id={`industry-${industry}`}
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
                                        Showing {filteredInternships.length} internship{filteredInternships.length !== 1 ? 's' : ''}
                                        {activeFilters > 0 && ' with applied filters'}
                                    </p>
                                </div>
                                
                                {filteredInternships.length > 0 ? (
                                    <div className="internships-list">
                                        {filteredInternships.map((internship) => (
                                            <Post 
                                                key={internship.id} 
                                                internship={internship} 
                                                isStudent={false} // SCAD admin view
                                                isScad={true} // SCAD admin view
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-results-container text-center py-5">
                                        <h5>No internships found</h5>
                                        <p className="text-muted">
                                            {internships.length === 0 
                                                ? "No internships have been posted by companies yet." 
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
                    </Tab>

                    <Tab eventKey="appointments" title="Appointments">
                        <Row className="mb-4">
                            <Col>
                                <h2 className="page-title">Student Appointments</h2>
                                <p className="text-muted">Manage appointment requests and schedule meetings with students</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <AppointmentSystem userType="scad" />
                            </Col>
                        </Row>
                    </Tab>

                    <Tab eventKey="workshops" title="Career Workshops">
                        <Row className="mb-4">
                            <Col>
                                <h2 className="page-title">Career Workshops</h2>
                                <p className="text-muted">Create and manage online workshops for students</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <WorkshopManagement />
                            </Col>
                        </Row>
                    </Tab>
                </Tabs>
            </Container>
        </div>
    );

}



