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
  const [searchQuery, setSearchQuery] = useState('');
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
    
    // 3. Get company evaluations
    const savedCompanyEvals = localStorage.getItem('CompanyEvaluations') || '[]';
    const companyEvals = JSON.parse(savedCompanyEvals);
    
    // 4. For each report, find matching student evaluation and company evaluation
    const reportsWithEvaluations = submitted.map(report => {
      // Find matching student evaluation
      const savedEvaluations = localStorage.getItem('studentCompanyEvaluations') || '[]';
      const evaluations = JSON.parse(savedEvaluations);
      const matchingEval = evaluations.find(
        evaluation => evaluation.internshipId === report.internshipId && evaluation.studentId === report.studentId
      );
      
      // Find matching company evaluation
      const matchingCompanyEval = companyEvals.find(
        evaluation => evaluation.studentId === report.studentId && evaluation.internshipId === report.internshipId
      );
      
      // Find student info from parsedStudents
      const student = parsedStudents.find(s => s.id === report.studentId);
      
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
        reviewedBy: report.reviewedBy || null
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
    // Always reload the latest data from localStorage first
    const savedReports = localStorage.getItem('internshipReports') || '[]';
    const reports = JSON.parse(savedReports);
    const savedCompanyEvals = localStorage.getItem('CompanyEvaluations') || '[]';
    const companyEvals = JSON.parse(savedCompanyEvals);
    const savedStudentEvals = localStorage.getItem('studentCompanyEvaluations') || '[]';
    const studentEvals = JSON.parse(savedStudentEvals);
    
    // If we're viewing a report, first get the most up-to-date version of it
    if (type === 'report') {
      // Find the latest version of this report
      const latestReport = reports.find(r => r.id === item.id);
      
      if (latestReport) {
        // Use the latest report data instead of the cached one
        item = latestReport;
      }
    }
    
    let enrichedItem = {...item, type};
    
    // If viewing a report, check if there's a matching company evaluation
    if (type === 'report') {
      // Look for the latest company evaluation by studentId and internshipId
      const matchingEval = companyEvals.find(
        evaluation => evaluation.studentId === item.studentId && evaluation.internshipId === item.internshipId
      );
      
      if (matchingEval) {
        enrichedItem.companyEvaluation = matchingEval;
      }
      
      // Look for the latest student evaluation
      const matchingStudentEval = studentEvals.find(
        evaluation => evaluation.internshipId === item.internshipId && evaluation.studentId === item.studentId
      );
      
      if (matchingStudentEval) {
        enrichedItem.hasEvaluation = true;
        enrichedItem.evaluationId = matchingStudentEval.id;
        enrichedItem.evaluationText = matchingStudentEval.text || '';
        enrichedItem.recommend = matchingStudentEval.recommend || false;
      }
      
      // Set the current status for the form
      setReportStatus(item.status || 'pending');
      setStatusComment(item.statusComment || '');
    }
    // If viewing the student's evaluation of the company
    else if (type === 'studentEvaluation') {
      // Get the latest student evaluation
      const latestStudentEval = studentEvals.find(
        evaluation => evaluation.internshipId === item.internshipId && evaluation.studentId === item.studentId
      );
      
      if (latestStudentEval) {
        // Use the latest student evaluation data
        enrichedItem = {
          ...item,
          type: 'studentEvaluation',
          evaluationId: latestStudentEval.id,
          evaluationText: latestStudentEval.text || '',
          recommend: latestStudentEval.recommend || false,
          date: latestStudentEval.date || item.date
        };
      } else {
        // Fall back to the report data
        enrichedItem = {
          ...item,
          type: 'studentEvaluation'
        };
      }
    }
    // If viewing a company evaluation directly
    else if (type === 'companyEvaluation') {
      // If we're looking at a company evaluation, get the latest version
      if (item.rating) {
        const latestCompanyEval = companyEvals.find(e => e.id === item.id);
        if (latestCompanyEval) {
          item = latestCompanyEval;
          enrichedItem = {...item, type: 'companyEvaluation'};
        }
      }
      
      // Check if we're passing a report or an evaluation
      if (!item.rating && !item.evaluationText) {
        // We're passing a report because there's no evaluation yet
        // Check one more time if an evaluation has been added since the report was loaded
        const freshMatchingEval = companyEvals.find(
          evaluation => evaluation.studentId === item.studentId && evaluation.internshipId === item.internshipId
        );
        
        if (freshMatchingEval) {
          // A new evaluation has been added since the report was loaded
          enrichedItem = {
            ...freshMatchingEval,
            type: 'companyEvaluation'
          };
          
          // Find student info
          const student = students.find(s => s.id === item.studentId);
          if (student) {
            enrichedItem.studentName = student.name;
          }
          
          // Find report info
          const matchingReport = reports.find(
            report => report.studentId === item.studentId && report.internshipId === item.internshipId
          );
          
          if (matchingReport) {
            enrichedItem.reportTitle = matchingReport.title;
            enrichedItem.companyName = matchingReport.companyName;
          }
        } else {
          // Still no evaluation
          const student = students.find(s => s.id === item.studentId);
          enrichedItem = {
            studentId: item.studentId,
            studentName: student ? student.name : 'Unknown Student',
            companyName: item.companyName,
            internshipId: item.internshipId,
            date: new Date().toISOString(),
            type: 'companyEvaluation',
            noEvaluationYet: true // Flag to indicate there's no evaluation yet
          };
        }
      } else {
        // We have an actual evaluation
        // Find the student associated with this evaluation
        const student = students.find(s => s.id === item.studentId);
        if (student) {
          enrichedItem.studentName = student.name;
        }
        
        // Find the matching report if it exists
        const matchingReport = reports.find(
          report => report.studentId === item.studentId && report.internshipId === item.internshipId
        );
        
        if (matchingReport) {
          enrichedItem.reportTitle = matchingReport.title;
          enrichedItem.companyName = matchingReport.companyName;
        }
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
      
      // Refresh the filtered reports
      filterReports(updatedReports);
    }
  };

  // Filter reports based on selected status, major, date, and search query
  const filterReports = (reports = submittedReports) => {
    if (reports.length > 0) {
      let filtered = [...reports];
      
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
          const reportDate = report.date ? report.date.slice(0, 10) : '';
          const reviewDate = report.reviewDate ? report.reviewDate.slice(0, 10) : '';
          return reportDate === dateFilter || reviewDate === dateFilter;
        });
      }
      
      // Apply search query filter (search in title, student name, company name)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(report => {
          const student = students.find(s => s.id === report.studentId);
          const studentName = student ? student.name.toLowerCase() : report.studentName.toLowerCase();
          const title = (report.title || '').toLowerCase();
          const company = (report.companyName || '').toLowerCase();
          const comment = (report.statusComment || '').toLowerCase();
          
          return studentName.includes(query) || 
                 title.includes(query) || 
                 company.includes(query) || 
                 comment.includes(query);
        });
      }
      
      setFilteredReports(filtered);
    } else {
      setFilteredReports([]);
    }
  };

  // Update filtered reports when filters or reports change
  useEffect(() => {
    filterReports();
  }, [submittedReports, statusFilter, majorFilter, dateFilter, searchQuery, students]);

  return (
    <Container className="faculty-reports-container mt-4">
      <h2 className="page-title">Student Internship Reports & Evaluations</h2>
      
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
      <div className="filters-container mb-4">
        <h4>Filter Reports</h4>
        <Row className="mt-3">
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="flagged">Flagged</option>
              </Form.Select>
            </Form.Group>
          </Col>
          
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Major</Form.Label>
              <Form.Select 
                value={majorFilter}
                onChange={(e) => setMajorFilter(e.target.value)}
              >
                <option value="all">All Majors</option>
                {availableMajors.map(major => (
                  <option key={major} value={major}>{major}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
              />
            </Form.Group>
          </Col>
          
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Search</Form.Label>
              <Form.Control
                type="text"
                placeholder="Search by name, company, title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        
        <div className="d-flex justify-content-end">
          <Button 
            variant="outline-secondary" 
            className="me-2"
            onClick={() => {
              setStatusFilter('all');
              setMajorFilter('all');
              setDateFilter('');
              setSearchQuery('');
            }}
          >
            Clear All Filters
          </Button>
        </div>
      </div>
      
      <div className="mb-4">
        <h4>Submitted Internship Reports</h4>
        
        {filteredReports.length > 0 ? (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Student</th>
                <th>Major</th>
                <th>Company</th>
                <th>Report Title</th>
                <th>Internship Period</th>
                <th>Status</th>
                <th>Submission Date</th>
                <th>Company Evaluation</th>
                <th>Last Reviewed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map(report => {
                const student = students.find(s => s.id === report.studentId);
                
                return (
                  <tr key={report.id}>
                    <td>{student ? student.name : report.studentName}</td>
                    <td>{student ? student.major : 'Unknown Major'}</td>
                    <td>{report.companyName}</td>
                    <td>{report.title || 'Untitled Report'}</td>
                    <td>
                      {report.startDate && report.endDate ? (
                        `${formatDate(report.startDate)} - ${formatDate(report.endDate)}`
                      ) : report.companyEvaluation?.internshipStartDate && report.companyEvaluation?.internshipEndDate ? (
                        `${formatDate(report.companyEvaluation.internshipStartDate)} - ${formatDate(report.companyEvaluation.internshipEndDate)}`
                      ) : (
                        <span className="text-muted">Not specified</span>
                      )}
                    </td>
                    <td>
                      {report.status === 'pending' && <Badge bg="warning" text="dark">Pending</Badge>}
                      {report.status === 'accepted' && <Badge bg="success">Accepted</Badge>}
                      {report.status === 'rejected' && <Badge bg="danger">Rejected</Badge>}
                      {report.status === 'flagged' && <Badge bg="info">Flagged</Badge>}
                      {!report.status && <Badge bg="warning" text="dark">Pending</Badge>}
                    </td>
                    <td>{formatDate(report.date)}</td>
                    <td>
                      {report.companyEvaluation ? (
                        <Badge bg={report.companyEvaluation.rating >= 4 ? 'success' : 
                               report.companyEvaluation.rating >= 3 ? 'warning' : 'danger'}>
                          {report.companyEvaluation.rating}/5
                        </Badge>
                      ) : (
                        <span className="text-muted">No evaluation</span>
                      )}
                    </td>
                    <td>
                      {report.reviewDate ? (
                        <>
                          {formatDate(report.reviewDate)}
                          <div className="small text-muted">by {report.reviewedByName || 'Unknown'}</div>
                        </>
                      ) : (
                        <span className="text-muted">Not reviewed yet</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={() => handleViewDetails(report, 'report')}
                          className="me-1 mb-1"
                        >
                          View Student's Report
                        </Button>
                        
                        {report.hasEvaluation && (
                          <Button 
                            variant="success" 
                            size="sm" 
                            onClick={() => handleViewDetails(report, 'studentEvaluation')}
                            className="me-1 mb-1"
                          >
                            Student's Company Review
                          </Button>
                        )}
                        
                        <Button 
                          variant="info" 
                          size="sm" 
                          onClick={() => handleViewDetails(report.companyEvaluation || report, 'companyEvaluation')}
                          className="mb-1"
                        >
                          Company Feedback
                        </Button>
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
              : (selectedItem?.type === 'companyEvaluation' 
                ? `Company Evaluation for ${selectedItem?.studentName}` 
                : (selectedItem?.type === 'studentEvaluation'
                  ? `${selectedItem?.studentName}'s Review of ${selectedItem?.companyName}`
                  : 'Details'))}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem?.type === 'studentEvaluation' && (
            <div className="student-evaluation-details">
              <div className="detail-header">
                <span className="detail-label">Student:</span> {selectedItem?.studentName}
              </div>
              <div className="detail-header">
                <span className="detail-label">Company:</span> {selectedItem?.companyName}
              </div>
              <div className="detail-header">
                <span className="detail-label">Submitted on:</span> {formatDate(selectedItem?.date)}
              </div>
              <div className="detail-header">
                <span className="detail-label">Recommendation:</span>
                {selectedItem?.recommend ? (
                  <Badge bg="success" className="ms-2">Recommended</Badge>
                ) : (
                  <Badge bg="secondary" className="ms-2">Not Recommended</Badge>
                )}
              </div>
              
              <div className="detail-content mt-4">
                <h5>Student's Company Evaluation:</h5>
                <div className="content-box">
                  {selectedItem?.evaluationText || 'No evaluation provided.'}
                </div>
              </div>
              
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
              {selectedItem?.companyName && (
                <div className="detail-header">
                  <span className="detail-label">Company:</span> {selectedItem?.companyName}
                </div>
              )}
              {selectedItem?.reportTitle && (
                <div className="detail-header">
                  <span className="detail-label">Related Report:</span> {selectedItem?.reportTitle}
                </div>
              )}
              
              {selectedItem?.noEvaluationYet ? (
                <div className="empty-evaluation-state mt-4 p-4 text-center">
                  <h5>No Company Evaluation Yet</h5>
                  <p className="text-muted">The company has not submitted an evaluation for this student yet.</p>
                  <div className="mt-3">
                    <Badge bg="secondary" className="p-2">Pending Evaluation</Badge>
                  </div>
                </div>
              ) : (
                <>
                  <div className="detail-header">
                    <span className="detail-label">Evaluation Date:</span> {formatDate(selectedItem?.date)}
                  </div>
                  <div className="detail-header">
                    <span className="detail-label">Rating:</span> 
                    <Badge bg={selectedItem?.rating >= 4 ? 'success' : 
                          selectedItem?.rating >= 3 ? 'warning' : 'danger'} className="ms-2">
                      {selectedItem?.rating}/5 - {
                        selectedItem?.rating === 5 ? 'Excellent' : 
                        selectedItem?.rating === 4 ? 'Very Good' : 
                        selectedItem?.rating === 3 ? 'Good' : 
                        selectedItem?.rating === 2 ? 'Fair' : 'Poor'
                      }
                    </Badge>
                  </div>
                  
                  {selectedItem?.supervisorName && (
                    <div className="detail-header">
                      <span className="detail-label">Supervisor:</span> {selectedItem?.supervisorName}
                    </div>
                  )}
                  
                  {selectedItem?.internshipStartDate && selectedItem?.internshipEndDate && (
                    <div className="detail-header">
                      <span className="detail-label">Internship Period:</span> 
                      {formatDate(selectedItem?.internshipStartDate)} - {formatDate(selectedItem?.internshipEndDate)}
                    </div>
                  )}
                  
                  <div className="detail-content mt-4">
                    <h5>Evaluation Comments:</h5>
                    <div className="content-box company-eval-box">
                      {selectedItem?.evaluationText || 'No comments provided.'}
                    </div>
                  </div>
                  
                  {selectedItem?.skills && selectedItem?.skills.length > 0 && (
                    <div className="detail-content mt-4">
                      <h5>Skills Demonstrated:</h5>
                      <div className="content-box">
                        <ul className="skills-list">
                          {selectedItem.skills.map((skill, index) => (
                            <li key={index}>{skill}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          
          {selectedItem?.type === 'report' && (
            <div className="report-details">
              <div className="detail-header">
                <span className="detail-label">Student:</span> {selectedItem?.studentName}
              </div>
              <div className="detail-header">
                <span className="detail-label">Company:</span> {selectedItem?.companyName}
              </div>
              <div className="detail-header">
                <span className="detail-label">Submitted on:</span> {formatDate(selectedItem?.date)}
              </div>
              
              {/* Current Status */}
              <div className="detail-header">
                <span className="detail-label">Current Status:</span>
                {selectedItem?.status === 'pending' && <Badge bg="warning" text="dark" className="ms-2">Pending</Badge>}
                {selectedItem?.status === 'accepted' && <Badge bg="success" className="ms-2">Accepted</Badge>}
                {selectedItem?.status === 'rejected' && <Badge bg="danger" className="ms-2">Rejected</Badge>}
                {selectedItem?.status === 'flagged' && <Badge bg="info" className="ms-2">Flagged</Badge>}
                {!selectedItem?.status && <Badge bg="warning" text="dark" className="ms-2">Pending</Badge>}
              </div>
              
              {/* Status Update Form */}
              <div className="status-update-form mt-4">
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
                  
                  {/* Show detailed form for rejected or flagged reports */}
                  {(reportStatus === 'rejected' || reportStatus === 'flagged') && (
                    <div className="rejection-details p-3 mb-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '0.5rem' }}>
                      <h6>{reportStatus === 'rejected' ? 'Rejection' : 'Flag'} Details</h6>
                      <Form.Group className="mb-3">
                        <Form.Label>Reason</Form.Label>
                        <Form.Select 
                          className="mb-2"
                          onChange={(e) => {
                            const selectedReason = e.target.value;
                            if (selectedReason === 'other') return;
                            
                            // Auto-populate comment based on selected reason
                            const reasonTexts = {
                              'incomplete': 'The report is incomplete. Please provide more details about your internship experience.',
                              'insufficient': 'The report lacks sufficient detail about the skills gained during the internship.',
                              'format': 'The report does not follow the required format. Please revise according to guidelines.',
                              'plagiarism': 'There are concerns about originality in parts of this report.',
                              'inappropriate': 'Some content in the report is deemed inappropriate for an academic submission.'
                            };
                            
                            setStatusComment(reasonTexts[selectedReason]);
                          }}
                        >
                          <option value="">Select a reason...</option>
                          <option value="incomplete">Incomplete Information</option>
                          <option value="insufficient">Insufficient Detail</option>
                          <option value="format">Format Issues</option>
                          <option value="plagiarism">Potential Plagiarism</option>
                          <option value="inappropriate">Inappropriate Content</option>
                          <option value="other">Other (specify below)</option>
                        </Form.Select>
                      </Form.Group>
                    </div>
                  )}
                  
                  <Form.Group className="mb-3">
                    <Form.Label>
                      {reportStatus === 'rejected' ? 'Rejection Feedback' : 
                       reportStatus === 'flagged' ? 'Flag Reason' : 'Status Comment'}
                    </Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={reportStatus === 'rejected' || reportStatus === 'flagged' ? 4 : 2} 
                      value={statusComment}
                      onChange={(e) => setStatusComment(e.target.value)}
                      placeholder={reportStatus === 'rejected' ? 'Provide detailed feedback about why this report was rejected...' : 
                                  reportStatus === 'flagged' ? 'Explain why this report has been flagged for further review...' :
                                  'Add a comment about this status update...'}
                      required={reportStatus === 'rejected' || reportStatus === 'flagged'}
                    />
                    {(reportStatus === 'rejected' || reportStatus === 'flagged') && !statusComment.trim() && (
                      <Form.Text className="text-danger">
                        A detailed explanation is required for {reportStatus} reports.
                      </Form.Text>
                    )}
                  </Form.Group>
                </Form>
              </div>
              {/* Report Content */}
              {selectedItem?.introduction && (
                <div className="detail-content mt-4">
                  <h2 className="page-title">Student Reports, Evaluations, and Company Assessments</h2>
                  <p className="text-muted">
                    Review and manage student internship reports, company evaluations, and assessments. You can filter by status, major, and date.
                  </p>
                  <h5>Report Introduction:</h5>
                  <div className="content-box">
                    {selectedItem.introduction}
                  </div>
                </div>
              )}
// ... (rest of the code remains the same)
              
              {selectedItem?.body && (
                <div className="detail-content mt-4">
                  <h5>Report Body:</h5>
                  <div className="content-box">
                    {selectedItem.body}
                  </div>
                </div>
              )}
              
              {/* Student's Evaluation of Company */}
              {selectedItem?.evaluationText && (
                <div className="detail-content mt-4">
                  <h5>Student's Company Evaluation:</h5>
                  <div className="content-box">
                    {selectedItem.evaluationText}
                    <div className="mt-2">
                      <strong>Recommendation: </strong>
                      {selectedItem.recommend ? (
                        <Badge bg="success">Recommended</Badge>
                      ) : (
                        <Badge bg="secondary">Not Recommended</Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Helpful Courses */}
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
              
              {/* Company's Evaluation of Student */}
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