import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, Table, Form } from 'react-bootstrap';
import '../css/StudentReportsPage.css'; // Shared styling for reports
import '../css/FacultyReportsPage.css'; // Specific styling for Faculty reports page
import { coursesByMajor, students as defaultStudents } from '../Data/UserData';

function FacultyReportsPage() {
  const [students, setStudents] = useState([]);
  const [submittedReports, setSubmittedReports] = useState([]);
  const [companyEvaluations, setCompanyEvaluations] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // State for report status update
  const [reportStatus, setReportStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  
  // State for filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [majorFilter, setMajorFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [filteredReports, setFilteredReports] = useState([]);
  const [availableMajors, setAvailableMajors] = useState([]);

  // Function to refresh data from localStorage
  const refreshData = () => {
    // Load current user
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    
    // Load all necessary data from localStorage
    loadUserData();
  };
  
  useEffect(() => {
    // Initial data load
    refreshData();
    
    // Set up a refresh interval to check for updates every 30 seconds
    const refreshInterval = setInterval(() => {
      refreshData();
    }, 30000); // 30 seconds
    
    // Clean up the interval when component unmounts
    return () => clearInterval(refreshInterval);
  }, []);
  
  const loadUserData = () => {
    // Load students data - combine both user storage and default students
    const savedStudents = localStorage.getItem('users') || '[]';
    let parsedStudents = JSON.parse(savedStudents).filter(user => user.role === 'student');
    
    // If no students in localStorage, use default students from UserData.js
    if (parsedStudents.length === 0) {
      parsedStudents = defaultStudents;
    }
    
    setStudents(parsedStudents);
    
    // Extract unique majors for filtering
    const majors = [...new Set(parsedStudents.map(student => student.major).filter(Boolean))];
    setAvailableMajors(majors);
    
    // Load all submitted reports immediately
    loadSubmittedReports(parsedStudents);
    
    // Load company evaluations about students
    loadCompanyEvaluations(parsedStudents);
  };

  const loadSubmittedReports = (parsedStudents) => {
    // 1. Get all reports
    const savedReports = localStorage.getItem('internshipReports') || '[]';
    const reports = JSON.parse(savedReports);
    
    // 2. Filter only submitted reports
    const submitted = reports.filter(report => report.isSubmitted === true);
    
    // 3. For each report, find matching evaluation if it exists - exactly as in ScadReportsPage
    const reportsWithEvaluations = submitted.map(report => {
      // Find matching evaluation
      const savedEvaluations = localStorage.getItem('studentCompanyEvaluations') || '[]';
      const evaluations = JSON.parse(savedEvaluations);
      const matchingEval = evaluations.find(
        evaluation => evaluation.internshipId === report.internshipId && evaluation.studentId === report.studentId
      );
      
      // Find student info from parsedStudents
      const student = parsedStudents.find(s => s.id === report.studentId);
      
      // For checking company evaluations
      const savedCompanyEvals = localStorage.getItem('CompanyEvaluations') || '[]';
      const companyEvals = JSON.parse(savedCompanyEvals);
      const matchingCompanyEval = companyEvals.find(
        evaluation => evaluation.studentId === report.studentId && evaluation.internshipId === report.internshipId
      );
      
      return {
        ...report,
        studentName: student ? student.name : 'Unknown Student',
        hasEvaluation: !!matchingEval,
        evaluationId: matchingEval?.id,
        evaluationText: matchingEval?.text || '',
        recommend: matchingEval?.recommend || false,
        companyEvaluation: matchingCompanyEval || null,
        status: report.status || 'pending', // Default to 'pending' if no status is set
        statusComment: report.statusComment || '',
        reviewedBy: report.reviewedBy || null,
        submissionDate: report.submissionDate || report.date // Ensure submissionDate is set
      };
    });
    
    setSubmittedReports(reportsWithEvaluations);
    setFilteredReports(reportsWithEvaluations); // Initialize filtered reports with all reports
  };

  const loadCompanyEvaluations = (parsedStudents) => {
    const savedCompanyEvals = localStorage.getItem('CompanyEvaluations') || '[]';
    const companyEvals = JSON.parse(savedCompanyEvals);
    
    // Enrich with student and company names
    const enrichedEvals = companyEvals.map(evaluation => {
      // Find student info from parsedStudents
      const student = parsedStudents.find(s => s.id === evaluation.studentId);
      return {
        ...evaluation,
        studentName: student ? student.name : 'Unknown Student',
      };
    });
    
    setCompanyEvaluations(enrichedEvals);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleViewDetails = (item, type = 'report') => {
    let enrichedItem = {...item, type};
    
    // If viewing a report, check if there's a matching company evaluation
    if (type === 'report') {
      const savedCompanyEvals = localStorage.getItem('CompanyEvaluations') || '[]';
      const companyEvals = JSON.parse(savedCompanyEvals);
      
      // Look for company evaluation by studentId and internshipId
      const matchingEval = companyEvals.find(
        evaluation => evaluation.studentId === item.studentId && evaluation.internshipId === item.internshipId
      );
      
      if (matchingEval) {
        enrichedItem.companyEvaluation = matchingEval;
      }
      
      // Set the current status for the form
      setReportStatus(item.status || 'pending');
      setStatusComment(item.statusComment || '');
    }
    // If viewing a company evaluation directly
    else if (type === 'companyEvaluation') {
      // Find the student associated with this evaluation
      const student = students.find(s => s.id === item.studentId);
      if (student) {
        enrichedItem.studentName = student.name;
      }
    }
    
    setSelectedItem(enrichedItem);
    setShowDetailsModal(true);
  };

  const getCourseNames = (courseIds, studentId) => {
    if (!courseIds || !courseIds.length) return [];
    
    // Find student to get their major
    const student = students.find(s => s.id === studentId);
    if (!student) return [];
    
    const userMajor = student.major;
    const majorCourseList = coursesByMajor[userMajor] || [];
    
    return courseIds.map(id => {
      const course = majorCourseList.find(c => c.id === id);
      return course ? `${course.code}: ${course.name}` : 'Unknown Course';
    });
  };

  // Update report status
  const handleUpdateStatus = () => {
    if (!selectedItem || !reportStatus) return;
    
    // Get all reports
    const savedReports = localStorage.getItem('internshipReports') || '[]';
    const reports = JSON.parse(savedReports);
    
    // Find the report to update
    const reportIndex = reports.findIndex(
      report => report.id === selectedItem.id
    );
    
    if (reportIndex >= 0) {
      // Update the report status
      reports[reportIndex] = {
        ...reports[reportIndex],
        status: reportStatus,
        statusComment: statusComment,
        reviewedBy: currentUser ? currentUser.id : null,
        reviewedByName: currentUser ? currentUser.name : 'Unknown Faculty',
        reviewDate: new Date().toISOString()
      };
      
      // Save back to localStorage
      localStorage.setItem('internshipReports', JSON.stringify(reports));
      
      // Update the local state
      const updatedReports = submittedReports.map(report => {
        if (report.id === selectedItem.id) {
          return {
            ...report,
            status: reportStatus,
            statusComment: statusComment,
            reviewedBy: currentUser ? currentUser.id : null,
            reviewedByName: currentUser ? currentUser.name : 'Unknown Faculty',
            reviewDate: new Date().toISOString()
          };
        }
        return report;
      });
      
      setSubmittedReports(updatedReports);
      
      // Close the modal
      setShowDetailsModal(false);
      
      // The filters will automatically be applied by the useEffect
      // But let's also explicitly call refresh to be sure
      refreshFilters();
    }
  };

  // Filter reports based on selected status and major
  useEffect(() => {
    console.log("Filtering reports:", {
      totalReports: submittedReports.length,
      statusFilter,
      majorFilter,
      dateFilter
    });
    
    if (submittedReports.length > 0) {
      let filtered = [...submittedReports];
      
      // Apply status filter (pending, accepted, rejected, flagged)
      if (statusFilter !== 'all') {
        filtered = filtered.filter(report => report.status === statusFilter);
      }
      
      // Apply major filter
      if (majorFilter !== 'all') {
        filtered = filtered.filter(report => {
          const student = students.find(s => s.id === report.studentId);
          return student && student.major === majorFilter;
        });
      }
      
      // Apply date filter
      if (dateFilter) {
        filtered = filtered.filter(report => {
          const reportDate = report.submissionDate ? report.submissionDate.slice(0, 10) : 
                            report.date ? report.date.slice(0, 10) : '';
          const reviewDate = report.reviewDate ? report.reviewDate.slice(0, 10) : '';
          return reportDate === dateFilter || reviewDate === dateFilter;
        });
      }
      
      setFilteredReports(filtered);
      console.log("Filtered reports:", filtered.length);
    } else {
      setFilteredReports([]);
    }
  }, [submittedReports, statusFilter, majorFilter, dateFilter, students]);

  // Add a function to refresh filters
  const refreshFilters = () => {
    // Create a fresh filtered copy based on current filter settings
    if (submittedReports.length > 0) {
      let filtered = [...submittedReports];
      
      // Apply status filter (pending, accepted, rejected, flagged)
      if (statusFilter !== 'all') {
        filtered = filtered.filter(report => report.status === statusFilter);
      }
      
      // Apply major filter
      if (majorFilter !== 'all') {
        filtered = filtered.filter(report => {
          const student = students.find(s => s.id === report.studentId);
          return student && student.major === majorFilter;
        });
      }
      
      // Apply date filter
      if (dateFilter) {
        filtered = filtered.filter(report => {
          const reportDate = report.submissionDate ? report.submissionDate.slice(0, 10) : 
                           report.date ? report.date.slice(0, 10) : '';
          const reviewDate = report.reviewDate ? report.reviewDate.slice(0, 10) : '';
          return reportDate === dateFilter || reviewDate === dateFilter;
        });
      }
      
      setFilteredReports(filtered);
    } else {
      setFilteredReports([]);
    }
  };

  return (
    <Container className="faculty-reports-container mt-4">
      <h2 className="page-title">Student Reports & Company Evaluations</h2>
      <p className="page-description">
        View submitted student reports and company evaluations in a consolidated view.
      </p>
      
      {/* Statistics Dashboard */}
      <div className="statistics-dashboard mb-4">
        <h4>Report Statistics</h4>
        <Row className="mt-3">
          <Col md={3} sm={6} className="mb-3">
            <Card className="text-center h-100">
              <Card.Body>
                <h2>{submittedReports.filter(r => r.status === 'pending').length}</h2>
                <p>Pending Reports</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="text-center h-100">
              <Card.Body>
                <h2>{submittedReports.filter(r => r.status === 'accepted').length}</h2>
                <p>Accepted Reports</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="text-center h-100">
              <Card.Body>
                <h2>{submittedReports.filter(r => r.status === 'rejected').length}</h2>
                <p>Rejected Reports</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="text-center h-100">
              <Card.Body>
                <h2>{submittedReports.filter(r => r.status === 'flagged').length}</h2>
                <p>Flagged Reports</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <div className="text-end">
          <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
            Generate Report
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="filters-container row mb-4">
        <div className="col-md-4">
          <Form.Group>
            <Form.Label>Filter by Status</Form.Label>
            <Form.Select 
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                // Refresh will happen via useEffect
              }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="flagged">Flagged</option>
            </Form.Select>
          </Form.Group>
        </div>
        
        <div className="col-md-4">
          <Form.Group>
            <Form.Label>Filter by Major</Form.Label>
            <Form.Select 
              value={majorFilter}
              onChange={(e) => {
                setMajorFilter(e.target.value);
                // Refresh will happen via useEffect
              }}
            >
              <option value="all">All Majors</option>
              {Array.from(new Set(students.map(s => s.major))).map(major => (
                <option key={major} value={major}>{major}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>
        
        <div className="col-md-4 d-flex align-items-end">
          <Button 
            variant="outline-secondary" 
            className="mb-3"
            onClick={() => {
              setStatusFilter('all');
              setMajorFilter('all');
              setDateFilter('');
              // Refresh will happen via useEffect
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>
      
      <div className="mb-4">
        <h4>Submitted Internship Reports & Evaluations</h4>
        
        {filteredReports.length > 0 ? (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Student</th>
                <th>Student ID</th>
                <th>Major</th>
                <th>Company</th>
                <th>Report Title</th>
                <th>Recommend</th>
                <th>Main Supervisor</th>
                <th>Internship Period</th>
                <th>Status</th>
                <th>Submission Date</th>
                <th>Company Evaluation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map(report => {
                const student = students.find(s => s.id === report.studentId);
                // Find matching company evaluation for this student/internship
                const matchingEval = companyEvaluations.find(
                  evaluation => evaluation.studentId === report.studentId
                );
                
                return (
                  <tr key={report.id}>
                    <td>{student ? student.name : report.studentName}</td>
                    <td>{student ? student.gucId : report.studentId}</td>
                    <td>{student ? student.major : 'Unknown Major'}</td>
                    <td>{report.companyName}</td>
                    <td>{report.title || 'Untitled Report'}</td>
                    <td>
                      {report.recommend ? (
                        <Badge bg="success">Recommended</Badge>
                      ) : (
                        <Badge bg="secondary">Not Recommended</Badge>
                      )}
                    </td>
                    <td>
                      {/* Supervisor Name from company evaluation if available */}
                      {matchingEval && matchingEval.supervisorName ? matchingEval.supervisorName : <span className="text-muted">N/A</span>}
                    </td>
                    <td>
                      {/* Internship Period from company evaluation if available */}
                      {matchingEval && matchingEval.internshipStartDate && matchingEval.internshipEndDate ? (
                        `${formatDate(matchingEval.internshipStartDate)} - ${formatDate(matchingEval.internshipEndDate)}`
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                    <td>
                      {report.status === 'pending' && <Badge bg="warning" text="dark">Pending</Badge>}
                      {report.status === 'accepted' && <Badge bg="success">Accepted</Badge>}
                      {report.status === 'rejected' && <Badge bg="danger">Rejected</Badge>}
                      {report.status === 'flagged' && <Badge bg="info">Flagged</Badge>}
                      {!report.status && <Badge bg="warning" text="dark">Pending</Badge>}
                    </td>
                    <td>{formatDate(report.submissionDate || report.date)}</td>
                    <td>
                      {matchingEval ? (
                        <Badge bg="success">Available</Badge>
                      ) : (
                        <Badge bg="secondary">Not Available</Badge>
                      )}
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={() => handleViewDetails(report, 'report')}
                          className="me-1"
                        >
                          View Student's Report
                        </Button>
                        
                        {matchingEval && (
                          <Button 
                            variant="info" 
                            size="sm" 
                            onClick={() => handleViewDetails(matchingEval, 'companyEvaluation')}
                          >
                            Company Feedback
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        ) : (
          <div className="empty-state">
            <h4>No Submitted Reports</h4>
            <p>There are no submitted reports from students yet.</p>
          </div>
        )}
      </div>

      {/* Details Modal for reports with status update functionality */}
      <Modal 
        show={showDetailsModal} 
        onHide={() => setShowDetailsModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedItem?.type === 'report' 
              ? (selectedItem?.title || `${selectedItem?.studentName}'s Report for ${selectedItem?.companyName}`) 
              : `Company Evaluation of ${selectedItem?.studentName}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem?.type === 'report' && (
            <div className="finalized-report-details">
              <div className="detail-header">
                <span className="detail-label">Student:</span> {selectedItem?.studentName}
              </div>
              <div className="detail-header">
                <span className="detail-label">Company:</span> {selectedItem?.companyName}
              </div>
              <div className="detail-header">
                <span className="detail-label">Submitted on:</span> {formatDate(selectedItem?.submissionDate || selectedItem?.date)}
              </div>
              <div className="detail-header">
                <span className="detail-label">Status:</span>
                {selectedItem?.status === 'pending' && <Badge bg="warning" text="dark" className="ms-2">Pending</Badge>}
                {selectedItem?.status === 'accepted' && <Badge bg="success" className="ms-2">Accepted</Badge>}
                {selectedItem?.status === 'rejected' && <Badge bg="danger" className="ms-2">Rejected</Badge>}
                {selectedItem?.status === 'flagged' && <Badge bg="info" className="ms-2">Flagged</Badge>}
                {!selectedItem?.status && <Badge bg="warning" text="dark" className="ms-2">Pending</Badge>}
              </div>
              
              {selectedItem?.evaluationText && (
                <>
                  <div className="detail-header">
                    <span className="detail-label">Recommendation:</span>
                    {selectedItem.recommend ? (
                      <Badge bg="success" className="ms-2">Recommended</Badge>
                    ) : (
                      <Badge bg="secondary" className="ms-2">Not Recommended</Badge>
                    )}
                  </div>
                  
                  <div className="detail-content mt-4">
                    <h5>Student Evaluation to the Company:</h5>
                    <div className="content-box">
                      {selectedItem.evaluationText || "No evaluation provided."}
                    </div>
                  </div>
                </>
              )}
              
              {/* Show Company's Evaluation of the Student if available */}
              {selectedItem?.companyEvaluation && (
                <div className="detail-content mt-4">
                  <h5>Company Evaluation of Student:</h5>
                  <div className="content-box company-eval-box">
                    <div className="mb-2">
                      <strong>Rating: </strong>
                      <Badge bg={
                        selectedItem.companyEvaluation.rating === 5 ? 'success' : 
                        selectedItem.companyEvaluation.rating === 4 ? 'success' : 
                        selectedItem.companyEvaluation.rating === 3 ? 'warning' : 'danger'
                      }>
                        {selectedItem.companyEvaluation.rating}/5 - {
                          selectedItem.companyEvaluation.rating === 5 ? 'Excellent' : 
                          selectedItem.companyEvaluation.rating === 4 ? 'Very Good' : 
                          selectedItem.companyEvaluation.rating === 3 ? 'Good' : 
                          selectedItem.companyEvaluation.rating === 2 ? 'Fair' : 'Poor'
                        }
                      </Badge>
                    </div>
                    <div>{selectedItem.companyEvaluation.evaluationText}</div>
                    <div className="text-muted mt-2 small">
                      Evaluation submitted on {formatDate(selectedItem.companyEvaluation.date)}
                    </div>
                  </div>
                </div>
              )}
              
              {selectedItem?.body && (
                <>
                  {selectedItem.introduction && (
                    <div className="detail-content mt-4">
                      <h5>Report Introduction:</h5>
                      <div className="content-box">
                        {selectedItem.introduction}
                      </div>
                    </div>
                  )}
                  
                  <div className="detail-content mt-4">
                    <h5>Report Body:</h5>
                    <div className="content-box">
                      {selectedItem.body}
                    </div>
                  </div>
                </>
              )}
              
              {selectedItem?.helpfulCourses && selectedItem.helpfulCourses.length > 0 && (
                <div className="detail-content mt-4">
                  <h5>Helpful Courses:</h5>
                  <ul className="helpful-courses-list">
                    {getCourseNames(selectedItem.helpfulCourses, selectedItem.studentId).map((course, index) => (
                      <li key={index}>{course}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {selectedItem?.type === 'companyEvaluation' && (
            <div className="company-evaluation-details">
              <div className="detail-header">
                <span className="detail-label">Student:</span> {selectedItem?.studentName}
              </div>
              <div className="detail-header">
                <span className="detail-label">Company:</span> {selectedItem?.companyName}
              </div>
              <div className="detail-header">
                <span className="detail-label">Position:</span> {selectedItem?.internshipTitle || 'Unknown Position'}
              </div>
              <div className="detail-header">
                <span className="detail-label">Evaluation Date:</span> {formatDate(selectedItem?.date)}
              </div>
              <div className="detail-header">
                <span className="detail-label">Rating:</span> 
                <Badge bg={
                  selectedItem?.rating === 5 ? 'success' : 
                  selectedItem?.rating === 4 ? 'success' : 
                  selectedItem?.rating === 3 ? 'warning' : 
                  'danger'
                } className="ms-2">
                  {selectedItem?.rating}/5 - {
                    selectedItem?.rating === 5 ? 'Excellent' : 
                    selectedItem?.rating === 4 ? 'Very Good' : 
                    selectedItem?.rating === 3 ? 'Good' : 
                    selectedItem?.rating === 2 ? 'Fair' : 'Poor'
                  }
                </Badge>
              </div>
              
              <div className="detail-content mt-4">
                <h5>Evaluation:</h5>
                <div className="content-box">
                  {selectedItem?.evaluationText || "No detailed evaluation provided."}
                </div>
              </div>
            </div>
          )}
          
          {/* Faculty-specific Status Update Form */}
          {selectedItem?.type === 'report' && (
            <div className="status-update-form mt-4 p-4" style={{ backgroundColor: '#f8f9fa', borderRadius: '0.5rem' }}>
              <h5>Update Report Status</h5>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Set Status</Form.Label>
                  <Form.Select 
                    value={reportStatus}
                    onChange={(e) => setReportStatus(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="flagged">Flagged</option>
                  </Form.Select>
                </Form.Group>
                
                {(reportStatus === 'rejected' || reportStatus === 'flagged') && (
                  <Form.Group className="mb-3">
                    <Form.Label>
                      {reportStatus === 'rejected' ? 'Rejection Feedback' : 'Flag Reason'}
                    </Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={3} 
                      value={statusComment}
                      onChange={(e) => setStatusComment(e.target.value)}
                      placeholder={reportStatus === 'rejected' ? 'Provide detailed feedback...' : 'Explain why this report is flagged...'}
                      required={reportStatus === 'rejected' || reportStatus === 'flagged'}
                    />
                  </Form.Group>
                )}
              </Form>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          {selectedItem?.type === 'report' && (
            <Button variant="primary" onClick={handleUpdateStatus}>
              Update Status
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default FacultyReportsPage;