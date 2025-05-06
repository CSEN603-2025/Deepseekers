import React, { useState, useEffect } from "react";
import Profile from "../components/Profile";
import LogoutButton from "../components/LogoutButton";
import PostInternship from "../components/PostInternship";
import Post from "../components/Post";
import { Container, Row, Col, Form, InputGroup, Button, Tabs, Tab, Accordion, Badge, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../css/CompanyDashBoard.css";
import { companies } from '../Data/UserData';

function CompanyDashBoard() {
    const [postedInternships, setPostedInternships] = useState([]);
    const [allInternships, setAllInternships] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState("all-internships");
    const navigate = useNavigate();
    
    // Edit internship state
    const [editingInternship, setEditingInternship] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    
    // Delete confirmation state
    const [internshipToDelete, setInternshipToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    // Form state for editing
    const [editForm, setEditForm] = useState({
        title: "",
        department: "",
        description: "",
        requirements: "",
        location: "",
        duration: "",
        deadline: "",
        startDate: "",
        paid: false,
        salary: "",
        additionalInfo: ""
    });
    
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
            const parsedUserData = JSON.parse(userData);
            setCurrentUser(parsedUserData);
            
            // Find the full company data from the companies array to ensure we have all fields
            const companyData = companies.find(c => c.id === parsedUserData.id);
            if (companyData) {
                // Merge the localStorage data with the full company data to ensure we have description and industry
                setCurrentUser({...parsedUserData, ...companyData});
            }
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
    
    // Edit Internship Handlers
    const handleEditInternship = (internship) => {
        setEditingInternship(internship);
        setEditForm({
            title: internship.title || "",
            department: internship.department || "",
            description: internship.description || "",
            requirements: internship.requirements || "",
            location: internship.location || "",
            duration: internship.duration || "",
            deadline: internship.deadline || "",
            startDate: internship.startDate || "",
            paid: internship.paid || false,
            salary: internship.salary || "",
            additionalInfo: internship.additionalInfo || ""
        });
        setShowEditModal(true);
    };
    
    const handleEditFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditForm({
            ...editForm,
            [name]: type === 'checkbox' ? checked : value
        });
    };
    
    const handleSaveEdit = () => {
        // Get all internships from localStorage
        const allInternshipsData = JSON.parse(localStorage.getItem('postedInternships')) || [];
        
        // Find the internship to update
        const updatedInternships = allInternshipsData.map(internship => {
            if (internship.id === editingInternship.id) {
                return {
                    ...internship,
                    ...editForm,
                    lastUpdated: new Date().toISOString()
                };
            }
            return internship;
        });
        
        // Save updated internships to localStorage
        localStorage.setItem('postedInternships', JSON.stringify(updatedInternships));
        
        // Update state with new data
        setAllInternships(enrichInternshipsWithIndustry(updatedInternships));
        
        // Update company internships
        const companyInternships = updatedInternships.filter(
            internship => internship.companyId === currentUser.id || internship.companyName === currentUser.name
        );
        setPostedInternships(enrichInternshipsWithIndustry(companyInternships));
        
        // Close modal and reset form
        setShowEditModal(false);
        setEditingInternship(null);
    };
    
    // Delete Internship Handlers
    const handleDeleteInternship = (internship) => {
        setInternshipToDelete(internship);
        setShowDeleteModal(true);
    };
    
    const confirmDeleteInternship = () => {
        if (!internshipToDelete) return;
        
        // Get all internships from localStorage
        const allInternshipsData = JSON.parse(localStorage.getItem('postedInternships')) || [];
        
        // Filter out the internship to delete
        const updatedInternships = allInternshipsData.filter(
            internship => internship.id !== internshipToDelete.id
        );
        
        // Save updated internships to localStorage
        localStorage.setItem('postedInternships', JSON.stringify(updatedInternships));
        
        // Update state with new data
        setAllInternships(enrichInternshipsWithIndustry(updatedInternships));
        
        // Update company internships
        const companyInternships = updatedInternships.filter(
            internship => internship.companyId === currentUser.id || internship.companyName === currentUser.name
        );
        setPostedInternships(enrichInternshipsWithIndustry(companyInternships));
        
        // Close modal and reset state
        setShowDeleteModal(false);
        setInternshipToDelete(null);
    };
    
    return (
        <div className="company-dashboard">
            <div className="logout-container" style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}>
                <LogoutButton />
            </div>
            
            <Profile 
                name={currentUser.name} 
                navigateTo="/company/edit-profile" 
                showEditButton={false}
                profileType="company"
                userData={currentUser}
            />
            
            <Container className="dashboard-container">
                <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className="mb-4 dashboard-tabs"
                >
                    <Tab eventKey="all-internships" title="All Internships">
                        <div className="tab-content-container">
                            <Row>
                                <Col md={3} className="filters-sidebar">
                                    <div className="filters-container">
                                        <div className="search-box mb-4">
                                            <label htmlFor="search-input-all" className="fw-bold mb-2">Search Internships</label>
                                            <InputGroup>
                                                <InputGroup.Text id="search-addon-all">
                                                    <i className="bi bi-search"></i>
                                                </InputGroup.Text>
                                                <Form.Control
                                                    id="search-input-all"
                                                    placeholder="Search by title or company"
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    value={searchTerm}
                                                />
                                            </InputGroup>
                                            <small className="text-muted mt-1">
                                                Search results will only match job title or company name
                                            </small>
                                        </div>
                                        
                                        <div className="filter-options">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
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
                                        </div>
                                    </div>
                                </Col>
                                
                                <Col md={9} className="posts-container">
                                    <div className="results-summary mb-3">
                                        <p className="results-count">
                                            Showing {filteredAllInternships.length} internship{filteredAllInternships.length !== 1 ? 's' : ''}
                                            {activeFilters > 0 && ' with applied filters'}
                                        </p>
                                    </div>
                                    
                                    {filteredAllInternships.length > 0 ? (
                                        <div className="internships-list">
                                            {filteredAllInternships.map((internship) => (
                                                <Post 
                                                    key={internship.id} 
                                                    internship={internship} 
                                                    isStudent={false} 
                                                    isScad={false}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="no-results-container text-center py-5">
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
                                <Row>
                                    <Col md={3} className="filters-sidebar">
                                        <div className="filters-container">
                                            <div className="search-box mb-4">
                                                <label htmlFor="search-input-company" className="fw-bold mb-2">Search My Internships</label>
                                                <InputGroup>
                                                    <InputGroup.Text id="search-addon-company">
                                                        <i className="bi bi-search"></i>
                                                    </InputGroup.Text>
                                                    <Form.Control
                                                        id="search-input-company"
                                                        placeholder="Search by job title"
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        value={searchTerm}
                                                    />
                                                </InputGroup>
                                            </div>
                                            
                                            <div className="filter-options">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
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
                                            </div>
                                            
                                            <div className="mt-4">
                                                <Button 
                                                    variant="primary" 
                                                    className="w-100"
                                                    onClick={() => setActiveTab("post-new")}
                                                >
                                                    + Post New Internship
                                                </Button>
                                            </div>
                                        </div>
                                    </Col>
                                    
                                    <Col md={9} className="posts-container">
                                        <div className="results-summary mb-3">
                                            <p className="results-count">
                                                Showing {filteredCompanyInternships.length} internship{filteredCompanyInternships.length !== 1 ? 's' : ''}
                                                {activeFilters > 0 && ' with applied filters'}
                                            </p>
                                        </div>
                                        
                                        {filteredCompanyInternships.length > 0 ? (
                                            <div className="internships-list">
                                                {filteredCompanyInternships.map((internship) => (
                                                    <div className="my-internship-post-container" key={internship.id}>
                                                        <Post
                                                            internship={internship}
                                                            isStudent={false}
                                                        />
                                                        <div className="post-management-buttons">
                                                            <Button 
                                                                variant="outline-primary" 
                                                                className="me-2 management-btn"
                                                                onClick={() => handleEditInternship(internship)}
                                                            >
                                                                <i className="bi bi-pencil-square"></i> Edit Internship
                                                            </Button>
                                                            <Button 
                                                                variant="outline-danger"
                                                                className="management-btn"
                                                                onClick={() => handleDeleteInternship(internship)}
                                                            >
                                                                <i className="bi bi-trash"></i> Delete Internship
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="no-results-container text-center py-5">
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
                            ) : (
                                <div className="no-internships-container text-center py-5">
                                    <h4>You haven't posted any internships yet</h4>
                                    <p>Create your first internship listing to attract qualified candidates</p>
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
            
            {/* Edit Internship Modal */}
            <Modal 
                show={showEditModal} 
                onHide={() => setShowEditModal(false)} 
                size="lg" 
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Edit Internship</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Internship Title*</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="title" 
                                value={editForm.title} 
                                onChange={handleEditFormChange} 
                                required 
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Department</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="department" 
                                value={editForm.department} 
                                onChange={handleEditFormChange} 
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Description*</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3} 
                                name="description" 
                                value={editForm.description} 
                                onChange={handleEditFormChange} 
                                required 
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Requirements</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3} 
                                name="requirements" 
                                value={editForm.requirements} 
                                onChange={handleEditFormChange} 
                            />
                        </Form.Group>
                        
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Location</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="location" 
                                        value={editForm.location} 
                                        onChange={handleEditFormChange} 
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Duration</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="duration" 
                                        value={editForm.duration} 
                                        onChange={handleEditFormChange} 
                                    />
                                    <Form.Text className="text-muted">
                                        Example: 3 months, 6 weeks, etc.
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                        
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Application Deadline</Form.Label>
                                    <Form.Control 
                                        type="date" 
                                        name="deadline" 
                                        value={editForm.deadline ? editForm.deadline.split('T')[0] : ''} 
                                        onChange={handleEditFormChange} 
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Start Date</Form.Label>
                                    <Form.Control 
                                        type="date" 
                                        name="startDate" 
                                        value={editForm.startDate ? editForm.startDate.split('T')[0] : ''} 
                                        onChange={handleEditFormChange} 
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        
                        <Form.Group className="mb-3">
                            <Form.Check 
                                type="checkbox" 
                                label="This is a paid internship" 
                                name="paid" 
                                checked={editForm.paid} 
                                onChange={handleEditFormChange} 
                            />
                        </Form.Group>
                        
                        {editForm.paid && (
                            <Form.Group className="mb-3">
                                <Form.Label>Compensation Details</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name="salary" 
                                    value={editForm.salary} 
                                    onChange={handleEditFormChange} 
                                    placeholder="E.g. $15/hour, $1000/month, etc." 
                                />
                            </Form.Group>
                        )}
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Additional Information</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={2} 
                                name="additionalInfo" 
                                value={editForm.additionalInfo} 
                                onChange={handleEditFormChange} 
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveEdit}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
            
            {/* Delete Confirmation Modal */}
            <Modal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete the internship <strong>{internshipToDelete?.title}</strong>?</p>
                    <p className="text-danger">This action cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDeleteInternship}>
                        Delete Internship
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default CompanyDashBoard;