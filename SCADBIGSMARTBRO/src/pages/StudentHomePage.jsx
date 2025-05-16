import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Nav, Button, InputGroup, Form, Badge, Tabs, Tab, Accordion } from 'react-bootstrap';
import Post from '../components/Post';
import WorkshopList from '../components/WorkshopList';
import AppointmentSystem from '../components/AppointmentSystem';
import PrerecordedWorkshops from '../components/PrerecordedWorkshops';
import LiveWorkshops from '../components/LiveWorkshops';
import MyCertifications from '../components/MyCertifications';
import VideoCallComponent from '../components/VideoCallComponent';
import { companies } from '../Data/UserData';
import StudentAssessmentsPage from '../pages/StudentAssessmentsPage';
import '../css/studentHome.css';
import '../css/liveWorkshops.css';
import RecommendedCompanies from '../components/RecommendedCompanies';

const StudentHomePage = () => {
  const [internships, setInternships] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPaid, setFilterPaid] = useState(false);
  const [filterUnpaid, setFilterUnpaid] = useState(false);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [durationFilter, setDurationFilter] = useState('all');
  const [activeFilters, setActiveFilters] = useState(0);
  const [activeTab, setActiveTab] = useState('availableInternships');
  const [activeWorkshopTab, setActiveWorkshopTab] = useState('all');
  const [studentMajor, setStudentMajor] = useState('');
  const [studentProfile, setStudentProfile] = useState(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [interests, setInterests] = useState(['Web Development', 'Mobile Apps', 'Data Science']);
  
  // Ref to keep track of interval
  const callCheckIntervalRef = useRef(null);
  
  // Map of majors to YouTube video IDs
  const majorVideos = {
    BI: 'fc9iL1ib-H4?si=WqWnKOh61kBnbeX2',
    Business: 'rXlQrAfwD8Q?si=Vr6I46sVuUHVGi0v',
    DMET: 'QOJScCMCCIE?si=K_9Tqv2yQrVb6XS7',
    IET: 'E_Iy34hFITE?si=PQCniVZs-W_zR2Yf',
    Law: 'aK2PVtgWLp8?si=BSrm6dLWFiL7ybAG',
    Management: 'NeveJDtJ1Ug?si=BlX_Popc2vuASuZ5',
    Mechatronic: 'FDIbdmMmbsA?si=2SNIfh9XJ3QSlytn',
    MET: '_WQ_VV4pXPc?si=rWsgpVSfVcTa2yWy',
    Pharmacy: 'c2b7a89VSw8?si=elgvdA0hDDVU29dN',
    Default: 'WRMfns31Cp8?si=PIXPBqHNGXRohTSC'
  };

  useEffect(() => {
    // First try to get the current user data (which includes pro status)
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // If pro status exists in currentUser, use that
    if (currentUser) {
      setStudentMajor(currentUser.major || 'Default');
      setStudentProfile(currentUser); // This will set the pro status from currentUser
    } else {
      // Fall back to studentProfile if currentUser isn't available
      const savedProfile = JSON.parse(localStorage.getItem('studentProfile'));
      if (savedProfile) {
        setStudentMajor(savedProfile.major || 'Default');
        setStudentProfile(savedProfile);
      }
    }
  }, []);

  const industries = [...new Set(companies.map(company => company.industry))];
  const durationOptions = [
    { value: 'all', label: 'All Durations' },
    { value: 'short', label: 'Short Term (< 3 months)' },
    { value: 'medium', label: 'Medium Term (3-6 months)' },
    { value: 'long', label: 'Long Term (> 6 months)' }
  ];

  const handleClearLocalStorage = () => {
    clearSpecificLocalStorageData(['postedInternships']);
    window.location.reload();
  };

  const parseDuration = (durationString) => {
    if (!durationString) return 0;
    try {
      const duration = durationString.toLowerCase();
      let totalMonths = 0;

      const monthsPattern = /(\d+)\s*(month|months|mo)/i;
      const monthsMatch = duration.match(monthsPattern);
      if (monthsMatch && monthsMatch[1]) {
        totalMonths += parseInt(monthsMatch[1], 10) || 0;
      }

      const weeksPattern = /(\d+)\s*(week|weeks|wk)/i;
      const weeksMatch = duration.match(weeksPattern);
      if (weeksMatch && weeksMatch[1]) {
        totalMonths += (parseInt(weeksMatch[1], 10) || 0) / 4;
      }

      const yearsPattern = /(\d+)\s*(year|years|yr)/i;
      const yearsMatch = duration.match(yearsPattern);
      if (yearsMatch && yearsMatch[1]) {
        totalMonths += (parseInt(yearsMatch[1], 10) || 0) * 12;
      }

      if (totalMonths === 0) {
        if (duration.includes('summer')) {
          totalMonths = 3;
        } else if (duration.includes('semester')) {
          totalMonths = 4;
        } else {
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
      return 0;
    }
  };

  useEffect(() => {
    const loadInternships = () => {
      const storedInternships = JSON.parse(localStorage.getItem('postedInternships')) || [];
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
    window.addEventListener('storage', loadInternships);

    return () => {
      window.removeEventListener('storage', loadInternships);
    };
  }, []);

  useEffect(() => {
    let count = 0;
    if (filterPaid || filterUnpaid) count++;
    if (selectedIndustries.length > 0) count++;
    if (durationFilter !== 'all') count++;
    setActiveFilters(count);
  }, [filterPaid, filterUnpaid, selectedIndustries, durationFilter]);

  const handleIndustryChange = (industry) => {
    if (selectedIndustries.includes(industry)) {
      setSelectedIndustries(selectedIndustries.filter(i => i !== industry));
    } else {
      setSelectedIndustries([...selectedIndustries, industry]);
    }
  };

  const clearFilters = () => {
    setFilterPaid(false);
    setFilterUnpaid(false);
    setSelectedIndustries([]);
    setDurationFilter('all');
    setSearchTerm('');
  };

  const filteredInternships = internships.filter(internship => {
    const matchesSearch = searchTerm === '' || 
      internship.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      internship.companyName?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesPaymentFilter = true;
    if (filterPaid && !filterUnpaid) {
      matchesPaymentFilter = internship.paid === true;
    } else if (!filterPaid && filterUnpaid) {
      matchesPaymentFilter = internship.paid === false;
    }

    const matchesIndustryFilter = selectedIndustries.length === 0 || 
      selectedIndustries.includes(internship.industry);

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

  useEffect(() => {
    // Dispatch a custom event when student returns to home page
    // NotificationButton can listen for this to refresh notifications
    const event = new CustomEvent('refresh-notifications');
    window.dispatchEvent(event);
  }, []);

  // Get current student ID - this should be fetched from localStorage
  const getCurrentStudentId = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser ? currentUser.gucId : null;
  };
  
  // Load student profile data
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
      setStudentProfile(currentUser);
      setStudentMajor(currentUser.major || '');
    }
  }, []);
  
  // Check for incoming calls
  useEffect(() => {
    const studentId = getCurrentStudentId();
    if (!studentId) return;
    
    // Function to check for active calls directed to this student
    const checkForCalls = () => {
      try {
        const callHistory = JSON.parse(localStorage.getItem('callHistory') || '[]');
        const activeCallForStudent = callHistory.find(call => 
          call.participants && 
          call.participants.includes(studentId) && 
          call.status === 'active' && 
          !call.rejected &&
          !call.accepted
        );
        
        if (activeCallForStudent) {
          console.log("Found active call:", activeCallForStudent);
          
          // Find the appointment details
          const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
          const appointment = appointments.find(apt => apt.id === activeCallForStudent.appointmentId);
          
          if (appointment) {
            setIncomingCall({
              ...activeCallForStudent,
              purpose: appointment.purpose,
              remoteUser: 'SCAD Officer'
            });
            
            // Play sound for incoming call
            const audio = new Audio('/sounds/call-ring.mp3');
            audio.loop = true;
            audio.play().catch(e => console.log('Audio play failed:', e));
            
            // Store audio element to stop it later
            window.incomingCallAudio = audio;
          }
        }
      } catch (error) {
        console.error("Error checking for calls:", error);
      }
    };
    
    // Check immediately
    checkForCalls();
    
    // Set up interval to check regularly (every 3 seconds)
    callCheckIntervalRef.current = setInterval(checkForCalls, 3000);
    
    // Clean up
    return () => {
      if (callCheckIntervalRef.current) {
        clearInterval(callCheckIntervalRef.current);
      }
      
      // Stop any playing audio
      if (window.incomingCallAudio) {
        window.incomingCallAudio.pause();
        window.incomingCallAudio = null;
      }
    };
  }, []);
  
  // Handle accepting an incoming call
  const handleAcceptCall = () => {
    if (!incomingCall) return;
    
    // Stop the ringtone
    if (window.incomingCallAudio) {
      window.incomingCallAudio.pause();
      window.incomingCallAudio = null;
    }
    
    const callHistory = JSON.parse(localStorage.getItem('callHistory') || '[]');
    const updatedCallHistory = callHistory.map(call => {
      if (call.id === incomingCall.id) {
        return { ...call, accepted: true };
      }
      return call;
    });
    
    localStorage.setItem('callHistory', JSON.stringify(updatedCallHistory));
    
    // Start video call
    setActiveCall(incomingCall);
    setIncomingCall(null);
    setShowVideoCall(true);
  };
  
  // Handle rejecting an incoming call
  const handleRejectCall = () => {
    if (!incomingCall) return;
    
    // Stop the ringtone
    if (window.incomingCallAudio) {
      window.incomingCallAudio.pause();
      window.incomingCallAudio = null;
    }
    
    const callHistory = JSON.parse(localStorage.getItem('callHistory') || '[]');
    const updatedCallHistory = callHistory.map(call => {
      if (call.id === incomingCall.id) {
        return {
          ...call,
          rejected: true,
          status: 'rejected',
          endTime: new Date().toISOString()
        };
      }
      return call;
    });
    
    localStorage.setItem('callHistory', JSON.stringify(updatedCallHistory));
    setIncomingCall(null);
  };
  
  // Handle ending an active call
  const handleEndCall = () => {
    if (!activeCall) return;
    
    const callHistory = JSON.parse(localStorage.getItem('callHistory') || '[]');
    const updatedCallHistory = callHistory.map(call => {
      if (call.id === activeCall.id) {
        return {
          ...call,
          status: 'ended',
          endTime: new Date().toISOString()
        };
      }
      return call;
    });
    
    localStorage.setItem('callHistory', JSON.stringify(updatedCallHistory));
    setShowVideoCall(false);
    setActiveCall(null);
  };

  return (
    <div className="student-home">
      <Container fluid className="internships-page-container">
        <Tabs
          id="student-home-tabs"
          activeKey={activeTab}
          onSelect={(tab) => setActiveTab(tab)}
          className="mb-3"
        >
          <Tab eventKey="availableInternships" title="Available Internships">
            <Row>
              <Col md={3} className="filters-sidebar">
                <div className="filters-container">
                  <h2 className="page-title">Available Internships</h2>
                  <p className="text-muted">Find and apply for internships that match your skills and interests</p>
                  <div className="search-box mb-4">
                    <label htmlFor="search-input" className="fw-bold mb-2">Search Internships</label>
                    <InputGroup>
                      <InputGroup.Text id="search-addon">
                        <i className="bi bi-search"></i>
                      </InputGroup.Text>
                      <Form.Control
                        id="search-input"
                        placeholder="Search by job title or company name"
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
                        isStudent={true} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="no-results-container text-center py-5">
                    <h5>No internships found</h5>
                    <p className="text-muted">
                      {internships.length === 0 
                        ? "No internships have been posted yet. Check back later!" 
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

          <Tab eventKey="internshipRequirements" title="Internship Requirements Video">
            <div className="video-container text-center py-5" style={{ background: 'transparent' }}>
              <h5>Internship Requirements for {studentMajor}</h5>
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${majorVideos[studentMajor] || majorVideos['Default']}`}
                title="Internship Requirements Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </Tab>

          <Tab 
            eventKey="appointments" 
            title={
              <>
                Appointments
                <Badge className="ms-2 pro-badge">PRO</Badge>
              </>
            }
          >
            {studentProfile?.pro ? (
              <AppointmentSystem userType="student" studentId={studentProfile.gucId} />
            ) : (
              <div className="pro-feature-locked">
                <h5>Pro Feature</h5>
                <p>This feature is only available for Pro students.</p>
              </div>
            )}
          </Tab>

          <Tab
            eventKey="assessments"
            title={
              <>
                Assessments
                <Badge className="ms-2 pro-badge">PRO</Badge>
              </>
            }
          >
            {studentProfile?.pro ? (
              <StudentAssessmentsPage />
            ) : (
              <div className="pro-feature-locked">
                <h5>Pro Feature</h5>
                <p>This feature is only available for Pro students.</p>
              </div>
            )}
          </Tab>
          
          <Tab
            eventKey="workshops"
            title={
              <>
                Workshops
                <Badge className="ms-2 pro-badge">PRO</Badge>
              </>
            }
          >
            {studentProfile?.pro ? (
              <div className="workshops-container">
                <Row>
                  <Col md={3} className="workshop-nav-sidebar">
                    <div className="workshop-nav-container">
                      <h5 className="mb-4">Workshop Categories</h5>
                      <div className="d-grid gap-2">
                        <Button
                          variant={activeWorkshopTab === 'all' ? 'primary' : 'outline-primary'}
                          onClick={() => setActiveWorkshopTab('all')}
                          className="text-start"
                        >
                          <i className="bi bi-calendar-event me-2"></i>
                          All Upcoming Workshops
                        </Button>
                        <Button
                          variant={activeWorkshopTab === 'prerecorded' ? 'primary' : 'outline-primary'}
                          onClick={() => setActiveWorkshopTab('prerecorded')}
                          className="text-start"
                        >
                          <i className="bi bi-play-circle me-2"></i>
                          Pre-recorded Workshops
                        </Button>
                        <Button
                          variant={activeWorkshopTab === 'live' ? 'primary' : 'outline-primary'}
                          onClick={() => setActiveWorkshopTab('live')}
                          className="text-start"
                        >
                          <i className="bi bi-broadcast me-2"></i>
                          Live Online Workshops
                        </Button>
                        <Button
                          variant={activeWorkshopTab === 'certificates' ? 'primary' : 'outline-primary'}
                          onClick={() => setActiveWorkshopTab('certificates')}
                          className="text-start"
                        >
                          <i className="bi bi-award me-2"></i>
                          My Certifications
                        </Button>
                      </div>
                    </div>
                  </Col>
                  <Col md={9}>
                    {activeWorkshopTab === 'all' && <WorkshopList studentId={studentProfile.gucId} />}
                    {activeWorkshopTab === 'prerecorded' && <PrerecordedWorkshops studentId={studentProfile.gucId} />}
                    {activeWorkshopTab === 'live' && <LiveWorkshops studentId={studentProfile.gucId} />}
                    {activeWorkshopTab === 'certificates' && <MyCertifications studentId={studentProfile.gucId} />}
                  </Col>
                </Row>
              </div>
            ) : (
              <div className="pro-feature-locked">
                <h5>Pro Feature</h5>
                <p>This feature is only available for Pro students.</p>
              </div>
            )}
          </Tab>

          <Tab eventKey="recommendedCompanies" title="Recommended Companies">
            <Row className="mb-3">
              <Col>
                <h4>Companies Recommended For You</h4>
                <p className="text-muted">Based on your interests, industry preferences, and recommendations from past interns</p>
              </Col>
            </Row>
            <RecommendedCompanies 
              studentInterests={interests} 
              studentMajor={studentMajor} 
              onSetInterests={(newInterests) => setInterests(newInterests)}
            />
          </Tab>
        </Tabs>
      </Container>

      {/* Video Call Component */}
      <VideoCallComponent
        isVisible={showVideoCall}
        onHide={handleEndCall}
        callData={activeCall}
      />
      
      {/* Incoming Call Component */}
      <VideoCallComponent
        isVisible={incomingCall !== null}
        onHide={handleRejectCall}
        callData={incomingCall}
        isIncoming={true}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
      />
    </div>
  );
};

export default StudentHomePage;