import React, { useState, useEffect } from 'react';
import Post from '../components/Post';
import AppointmentSystem from '../components/AppointmentSystem';
import WorkshopManagement from '../components/WorkshopManagement';
import { Container, Row, Col, Form, InputGroup, Button, Accordion, Badge, Tabs, Tab, Table, Card, Alert, Modal } from 'react-bootstrap';
import { companies, students } from '../Data/UserData';
import '../css/scadHome.css';
import '../css/StudentProfilePage.css'; // Import student profile styles
import Profile from '../components/Profile';

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
    
    // Internship cycle state
    const [cycleDates, setCycleDates] = useState({
        startDate: localStorage.getItem('internshipCycleStartDate') || '',
        endDate: localStorage.getItem('internshipCycleEndDate') || ''
    });
    const [cycleActive, setCycleActive] = useState(false);
    const [cycleError, setCycleError] = useState('');
    
    // Students management state - modified to use data from UserData.js
    const [studentsList, setStudentsList] = useState([]);
    const [studentSearchTerm, setStudentSearchTerm] = useState('');
    const [studentStatusFilter, setStudentStatusFilter] = useState('all');
    
    // Student profile modal state
    const [showStudentProfileModal, setShowStudentProfileModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentProfile, setStudentProfile] = useState(null);
    
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
    
    // Load students from UserData.js and enrich with application status
    useEffect(() => {
        // Get applied internships to determine each student's status
        const appliedInternships = JSON.parse(localStorage.getItem('appliedInternships')) || [];
        
        // Enrich students with their application status if available
        const enrichedStudents = students.map(student => {
            // Find all applications for this student
            const studentApplications = appliedInternships.filter(app => 
                app.studentId === student.id || app.studentEmail === student.email
            );
            
            // Determine current status - prioritize in this order: current_intern, internship_complete, accepted, finalized, pending, rejected, none
            let status = 'none';
            
            if (studentApplications.length > 0) {
                if (studentApplications.some(app => app.status === 'current_intern')) {
                    status = 'current_intern';
                } else if (studentApplications.some(app => app.status === 'internship_complete')) {
                    status = 'internship_complete';
                } else if (studentApplications.some(app => app.status === 'accepted')) {
                    status = 'accepted';
                } else if (studentApplications.some(app => app.status === 'finalized')) {
                    status = 'finalized';
                } else if (studentApplications.some(app => app.status === 'pending')) {
                    status = 'pending';
                } else if (studentApplications.some(app => app.status === 'rejected')) {
                    status = 'rejected';
                }
            }
            
            return {
                ...student,
                status
            };
        });
        
        setStudentsList(enrichedStudents);
        
        // Check if cycle is active
        const startDate = localStorage.getItem('internshipCycleStartDate');
        const endDate = localStorage.getItem('internshipCycleEndDate');
        
        if (startDate && endDate) {
            const now = new Date();
            const cycleStart = new Date(startDate);
            const cycleEnd = new Date(endDate);
            
            setCycleActive(now >= cycleStart && now <= cycleEnd);
        } else {
            setCycleActive(false);
        }
    }, []);
    
    // Handle cycle date changes
    const handleCycleDateChange = (e) => {
        const { name, value } = e.target;
        setCycleDates({
            ...cycleDates,
            [name]: value
        });
        setCycleError('');
    };
    
    // Save cycle dates
    const saveCycleDates = () => {
        const startDate = new Date(cycleDates.startDate);
        const endDate = new Date(cycleDates.endDate);
        
        // Validation
        if (!cycleDates.startDate || !cycleDates.endDate) {
            setCycleError('Both start and end dates are required.');
            return;
        }
        
        if (endDate <= startDate) {
            setCycleError('End date must be after start date.');
            return;
        }
        
        // Save to localStorage
        localStorage.setItem('internshipCycleStartDate', cycleDates.startDate);
        localStorage.setItem('internshipCycleEndDate', cycleDates.endDate);
        
        // Check if cycle is currently active
        const now = new Date();
        setCycleActive(now >= startDate && now <= endDate);
        
        setCycleError('');
        alert('Internship cycle dates saved successfully!');
    };
    
    // Get status badge variant
    const getStatusBadgeVariant = (status) => {
        switch(status) {
            case 'current_intern': return 'primary';
            case 'internship_complete': return 'success';
            case 'accepted': return 'info';
            case 'finalized': return 'warning';
            case 'pending': return 'secondary';
            case 'rejected': return 'danger';
            default: return 'light';
        }
    };
    
    // Get formatted status label
    const getStatusLabel = (status) => {
        switch(status) {
            case 'current_intern': return 'Current Intern';
            case 'internship_complete': return 'Internship Complete';
            case 'accepted': return 'Accepted';
            case 'finalized': return 'Application Finalized';
            case 'pending': return 'Application Pending';
            case 'rejected': return 'Application Rejected';
            default: return 'No Application';
        }
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

    // Filter students based on search and status filter - modified to search only by name
    const filteredStudents = studentsList.filter(student => {
        // Match search term (name only)
        const matchesSearch = studentSearchTerm === '' || 
            student.name?.toLowerCase().includes(studentSearchTerm.toLowerCase());
            
        // Match status filter
        const matchesStatus = studentStatusFilter === 'all' || student.status === studentStatusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
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
        setStudentSearchTerm('');
        setStudentStatusFilter('all');
    };
    
    // Load student profile data
    const loadStudentProfile = (student) => {
        setSelectedStudent(student);
        
        // Try to find the profile data specific to this student
        let profileData = null;
        
        // First check if there's a specific student profile in localStorage
        const allStudentProfiles = JSON.parse(localStorage.getItem('allStudentProfiles')) || {};
        if (allStudentProfiles[student.id]) {
            // If this student has a profile saved in allStudentProfiles, use it
            profileData = allStudentProfiles[student.id];
        } else {
            // If not found in allStudentProfiles, check if there's a studentProfile in localStorage
            // that might belong to this student (by matching email or name)
            const studentProfile = localStorage.getItem('studentProfile');
            if (studentProfile) {
                const parsedProfile = JSON.parse(studentProfile);
                
                // Check if the currentUser in localStorage matches this student
                const currentUser = localStorage.getItem('currentUser');
                if (currentUser) {
                    const parsedUser = JSON.parse(currentUser);
                    if (parsedUser.id === student.id || 
                        parsedUser.email === student.email ||
                        parsedUser.name === student.name) {
                        // This profile likely belongs to this student
                        profileData = parsedProfile;
                    }
                }
            }
        }
        
        // If no profile data found, create a default empty profile
        if (!profileData) {
            profileData = {
                jobInterests: '',
                internships: '',
                activities: '',
                major: student.major || '',
                semester: '',
            };
        }
        
        setStudentProfile(profileData);
        setShowStudentProfileModal(true);
    };
    
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
                    
                    <Tab eventKey="cycle" title="Internship Cycle">
                        <Row className="mb-4">
                            <Col>
                                <h2 className="page-title">Internship Cycle Management</h2>
                                <p className="text-muted">Set the start and end dates for the current internship cycle</p>
                            </Col>
                        </Row>
                        
                        <Row className="mb-4">
                            <Col md={6}>
                                <Card>
                                    <Card.Header className="bg-primary text-white">
                                        <h5 className="mb-0">Set Internship Cycle Dates</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        {cycleError && <Alert variant="danger">{cycleError}</Alert>}
                                        
                                        {cycleActive ? (
                                            <Alert variant="success">
                                                <Alert.Heading>Active Internship Cycle</Alert.Heading>
                                                <p>
                                                    The internship cycle is currently active. Students can submit their internship reports.
                                                </p>
                                            </Alert>
                                        ) : (
                                            <Alert variant="warning">
                                                <Alert.Heading>Inactive Cycle</Alert.Heading>
                                                <p>
                                                    The internship cycle is not currently active. Students will not be able to submit reports.
                                                </p>
                                            </Alert>
                                        )}
                                        
                                        <Form>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Cycle Start Date</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    name="startDate"
                                                    value={cycleDates.startDate}
                                                    onChange={handleCycleDateChange}
                                                />
                                                <Form.Text className="text-muted">
                                                    The date when students can start submitting internship reports
                                                </Form.Text>
                                            </Form.Group>
                                            
                                            <Form.Group className="mb-3">
                                                <Form.Label>Cycle End Date</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    name="endDate"
                                                    value={cycleDates.endDate}
                                                    onChange={handleCycleDateChange}
                                                />
                                                <Form.Text className="text-muted">
                                                    The last date for students to submit internship reports
                                                </Form.Text>
                                            </Form.Group>
                                            
                                            <Button variant="primary" onClick={saveCycleDates}>
                                                Save Cycle Dates
                                            </Button>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            </Col>
                            
                            <Col md={6}>
                                <Card>
                                    <Card.Header className="bg-info text-white">
                                        <h5 className="mb-0">About Internship Cycles</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <p>
                                            An internship cycle defines the period when students can submit their
                                            internship reports and documentation. Outside this period, the submission 
                                            system will be closed.
                                        </p>
                                        <p>
                                            <strong>Current settings:</strong>
                                        </p>
                                        <ul>
                                            <li>
                                                <strong>Start Date:</strong> {cycleDates.startDate ? new Date(cycleDates.startDate).toLocaleDateString() : 'Not set'}
                                            </li>
                                            <li>
                                                <strong>End Date:</strong> {cycleDates.endDate ? new Date(cycleDates.endDate).toLocaleDateString() : 'Not set'}
                                            </li>
                                            <li>
                                                <strong>Status:</strong> {cycleActive ? 'Active' : 'Inactive'}
                                            </li>
                                        </ul>
                                        <p className="mb-0 text-muted">
                                            Note: The system will automatically check these dates to determine
                                            if the submission system should be open or closed.
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Tab>
                    
                    <Tab eventKey="students" title="Students">
                        <Row className="mb-4">
                            <Col>
                                <h2 className="page-title">Student Management</h2>
                                <p className="text-muted">View and filter all students registered in the system</p>
                            </Col>
                        </Row>
                        
                        <Row className="mb-4">
                            <Col md={8}>
                                <InputGroup className="mb-3">
                                    <InputGroup.Text id="student-search-addon">
                                        <i className="bi bi-search"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        placeholder="Search students by name"
                                        value={studentSearchTerm}
                                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Select 
                                        value={studentStatusFilter} 
                                        onChange={(e) => setStudentStatusFilter(e.target.value)}
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="current_intern">Current Interns</option>
                                        <option value="internship_complete">Completed Internship</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="finalized">Finalized Applications</option>
                                        <option value="pending">Pending Applications</option>
                                        <option value="rejected">Rejected Applications</option>
                                        <option value="none">No Applications</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        
                        <Row>
                            <Col>
                                <div className="table-responsive">
                                    <Table striped bordered hover>
                                        <thead className="table-primary">
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Student ID</th>
                                                <th>Major</th>
                                                <th>Internship Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredStudents.length > 0 ? (
                                                filteredStudents.map(student => (
                                                    <tr key={student.id}>
                                                        <td>{student.name}</td>
                                                        <td>{student.email}</td>
                                                        <td>{student.gucId || 'N/A'}</td>
                                                        <td>{student.major || 'N/A'}</td>
                                                        <td>
                                                            <Badge bg={getStatusBadgeVariant(student.status)}>
                                                                {getStatusLabel(student.status)}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <Button 
                                                                variant="outline-primary" 
                                                                size="sm"
                                                                onClick={() => loadStudentProfile(student)}
                                                            >
                                                                View Profile
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="text-center py-4">
                                                        {studentsList.length === 0 ? (
                                                            "No students found in the system."
                                                        ) : (
                                                            "No students matching your search criteria."
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                                
                                <div className="mt-3">
                                    <p className="text-muted">
                                        Showing {filteredStudents.length} of {studentsList.length} students
                                    </p>
                                </div>
                            </Col>
                        </Row>
                    </Tab>
                </Tabs>
            </Container>
            
            {/* Student Profile Modal */}
            <Modal
                show={showStudentProfileModal}
                onHide={() => setShowStudentProfileModal(false)}
                size="lg"
                aria-labelledby="student-profile-modal"
                centered
                dialogClassName="student-profile-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="student-profile-modal">
                        Student Profile
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    {selectedStudent && (
                        <div className="student-profile-page">
                            {/* Profile component - same as in StudentProfilePage.jsx */}
                            <Profile 
                                name={selectedStudent.name}
                                navigateTo="#"
                                showEditButton={false}  // No edit button in read-only mode
                                profileType="student"
                                userData={selectedStudent}
                                onEditClick={() => {}} // Empty function since we're in read-only mode
                            />
                            
                            {/* Profile details section - same layout as StudentProfilePage.jsx */}
                            <Container className="profile-details-section mt-4">
                                <Row>
                                    <Col md={12}>
                                        <div className="profile-info-container">
                                            <h3 className="section-title">
                                                Student Profile
                                                <Badge 
                                                    bg={getStatusBadgeVariant(selectedStudent.status)}
                                                    className="ms-3"
                                                >
                                                    {getStatusLabel(selectedStudent.status)}
                                                </Badge>
                                            </h3>
                                            
                                            <div className="profile-info">
                                                <div className="info-section">
                                                    <h5>Job Interests</h5>
                                                    <p>{studentProfile.jobInterests || "Not specified"}</p>
                                                </div>
                                                
                                                <div className="info-section">
                                                    <h5>Previous Internships / Part-time Jobs</h5>
                                                    <p>{studentProfile.internships || "None"}</p>
                                                </div>
                                                
                                                <div className="info-section">
                                                    <h5>College Activities</h5>
                                                    <p>{studentProfile.activities || "None"}</p>
                                                </div>
                                                
                                                <div className="info-section">
                                                    <h5>Academic Information</h5>
                                                    <p>
                                                        <strong>Major:</strong> {studentProfile.major || selectedStudent.major || "Not specified"}<br />
                                                        {studentProfile.semester && (
                                                            <><strong>Semester:</strong> {studentProfile.semester}</>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Container>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowStudentProfileModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );

}



