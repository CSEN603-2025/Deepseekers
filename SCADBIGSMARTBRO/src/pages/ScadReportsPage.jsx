import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, Table, Form, ProgressBar } from 'react-bootstrap';
import '../css/StudentReportsPage.css'; // Shared styling for reports
import '../css/ScadReportsPage.css'; // Specific styling for SCAD reports page
import { coursesByMajor, students as defaultStudents } from '../Data/UserData';

function ScadReportsPage() {
  const [students, setStudents] = useState([]);
  const [submittedReports, setSubmittedReports] = useState([]);
  const [companyEvaluations, setCompanyEvaluations] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // State for advanced statistics
  const [averageReviewTime, setAverageReviewTime] = useState(0);
  const [topCourses, setTopCourses] = useState([]);
  const [topRatedCompanies, setTopRatedCompanies] = useState([]);
  const [topCompaniesByCount, setTopCompaniesByCount] = useState([]);
  
  // New state for filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [majorFilter, setMajorFilter] = useState('all');
  const [filteredReports, setFilteredReports] = useState([]);

  useEffect(() => {
    // Load all necessary data from localStorage
    loadUserData();
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
    
    // 3. For each report, find matching evaluation if it exists
    const reportsWithEvaluations = submitted.map(report => {
      // Find matching evaluation
      const savedEvaluations = localStorage.getItem('studentCompanyEvaluations') || '[]';
      const evaluations = JSON.parse(savedEvaluations);
      const matchingEval = evaluations.find(
        evaluation => evaluation.internshipId === report.internshipId && evaluation.studentId === report.studentId
      );
      
      // Find student info from parsedStudents (which includes both localStorage and default students)
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
        status: report.status || 'pending', // Default to 'pending' if no status is set
        companyEvaluation: matchingCompanyEval || null,
        reviewDate: report.reviewDate || null,
        submissionDate: report.submissionDate || report.date // Ensure submissionDate is set
      };
    });
    
    setSubmittedReports(reportsWithEvaluations);
    setFilteredReports(reportsWithEvaluations); // Initialize filtered reports with all reports
    
    // Calculate advanced statistics
    calculateAdvancedStatistics(reportsWithEvaluations, companyEvaluations, parsedStudents);
  };
  const loadCompanyEvaluations = (parsedStudents) => {
    const savedCompanyEvals = localStorage.getItem('CompanyEvaluations') || '[]';
    const companyEvals = JSON.parse(savedCompanyEvals);
    
    // Enrich with student and company names
    const enrichedEvals = companyEvals.map(evaluation => {
      // Find student info from parsedStudents (which includes both localStorage and default students)
      const student = parsedStudents.find(s => s.id === evaluation.studentId);
      return {
        ...evaluation,
        studentName: student ? student.name : 'Unknown Student',
      };
    });
    
    setCompanyEvaluations(enrichedEvals);
  };
  
  // Function to calculate advanced statistics
  const calculateAdvancedStatistics = (reports, evaluations, students) => {
    // 1. Calculate average review time
    const reviewedReports = reports.filter(report => report.reviewDate && report.submissionDate);
    if (reviewedReports.length > 0) {
      const totalReviewTimeHours = reviewedReports.reduce((total, report) => {
        const submissionDate = new Date(report.submissionDate);
        const reviewDate = new Date(report.reviewDate);
        const diffHours = (reviewDate - submissionDate) / (1000 * 60 * 60); // Convert ms to hours
        return total + diffHours;
      }, 0);
      setAverageReviewTime(totalReviewTimeHours / reviewedReports.length);
    } else {
      setAverageReviewTime(0);
    }
    
    // 2. Find most frequently used courses in internships
    const courseFrequency = {};
    reports.forEach(report => {
      if (report.helpfulCourses && report.helpfulCourses.length > 0) {
        report.helpfulCourses.forEach(courseId => {
          // Find the course name
          const student = students.find(s => s.id === report.studentId);
          if (student && student.major) {
            const majorCourses = coursesByMajor[student.major] || [];
            const course = majorCourses.find(c => c.id === courseId);
            if (course) {
              const courseName = `${course.code}: ${course.name}`;
              courseFrequency[courseName] = (courseFrequency[courseName] || 0) + 1;
            }
          }
        });
      }
    });
    
    // Convert to array and sort by frequency
    const sortedCourses = Object.entries(courseFrequency)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 courses
    
    setTopCourses(sortedCourses);
    
    // 3. Find top rated companies based on student evaluations
    const companyRatings = {};
    const companyEvaluationCounts = {};
    
    // Get all student evaluations of companies
    const savedEvaluations = localStorage.getItem('studentCompanyEvaluations') || '[]';
    const studentEvals = JSON.parse(savedEvaluations);
    
    studentEvals.forEach(evaluation => {
      if (evaluation.companyName && evaluation.recommend !== undefined) {
        // Using recommend as a binary rating (true = 1, false = 0)
        companyRatings[evaluation.companyName] = companyRatings[evaluation.companyName] || 0;
        companyRatings[evaluation.companyName] += evaluation.recommend ? 1 : 0;
        
        companyEvaluationCounts[evaluation.companyName] = (companyEvaluationCounts[evaluation.companyName] || 0) + 1;
      }
    });
    
    // Calculate average rating for each company
    const companyAvgRatings = Object.keys(companyRatings).map(company => ({
      name: company,
      rating: companyRatings[company] / companyEvaluationCounts[company], // Average rating (0-1)
      count: companyEvaluationCounts[company]
    }));
    
    // Sort by rating and get top 5
    const topRated = companyAvgRatings
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
    
    setTopRatedCompanies(topRated);
    
    // 4. Find top companies by internship count
    const companyInternshipCounts = {};
    
    reports.forEach(report => {
      if (report.companyName) {
        companyInternshipCounts[report.companyName] = (companyInternshipCounts[report.companyName] || 0) + 1;
      }
    });
    
    // Convert to array and sort by count
    const sortedCompanies = Object.entries(companyInternshipCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 companies
    
    setTopCompaniesByCount(sortedCompanies);
  };

    // Report status will be managed by Faculty academics in a separate page

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
  // Filter reports based on selected status and major
  useEffect(() => {
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
      
      setFilteredReports(filtered);
    } else {
      setFilteredReports([]);
    }
  }, [submittedReports, statusFilter, majorFilter, students]);

  return (
    <Container className="scad-reports-container mt-4">
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
        
        {/* Advanced Statistics */}
        <h4 className="mt-4">Advanced Analytics</h4>
        <Row className="mt-3">
          {/* Average Review Time */}
          <Col md={6} className="mb-3">
            <Card className="h-100">
              <Card.Body>
                <h5>Average Review Time</h5>
                <div className="d-flex align-items-center justify-content-between">
                  <h3>{averageReviewTime.toFixed(1)} hours</h3>
                  <div className="text-muted">per report</div>
                </div>
                <div className="mt-2">
                  <small className="text-muted">
                    Based on {submittedReports.filter(r => r.reviewDate && r.submissionDate).length} reviewed reports
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          {/* Most Frequently Used Courses */}
          <Col md={6} className="mb-3">
            <Card className="h-100">
              <Card.Body>
                <h5>Most Used Courses in Internships</h5>
                {topCourses.length > 0 ? (
                  <div>
                    {topCourses.map((course, index) => (
                      <div key={index} className="mb-2">
                        <div className="d-flex justify-content-between">
                          <span>{course.name}</span>
                          <span className="badge bg-info">{course.count}</span>
                        </div>
                        <ProgressBar 
                          now={(course.count / topCourses[0].count) * 100} 
                          variant="info" 
                          style={{ height: '8px' }} 
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No course data available</p>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          {/* Top Rated Companies */}
          <Col md={6} className="mb-3">
            <Card className="h-100">
              <Card.Body>
                <h5>Top Rated Companies</h5>
                {topRatedCompanies.length > 0 ? (
                  <div>
                    {topRatedCompanies.map((company, index) => (
                      <div key={index} className="mb-2">
                        <div className="d-flex justify-content-between">
                          <span>{company.name}</span>
                          <span className="badge bg-success">
                            {(company.rating * 100).toFixed(0)}% recommended
                          </span>
                        </div>
                        <ProgressBar 
                          now={company.rating * 100} 
                          variant="success" 
                          style={{ height: '8px' }} 
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No company ratings available</p>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          {/* Top Companies by Internship Count */}
          <Col md={6} className="mb-3">
            <Card className="h-100">
              <Card.Body>
                <h5>Top Companies by Internship Count</h5>
                {topCompaniesByCount.length > 0 ? (
                  <div>
                    {topCompaniesByCount.map((company, index) => (
                      <div key={index} className="mb-2">
                        <div className="d-flex justify-content-between">
                          <span>{company.name}</span>
                          <span className="badge bg-primary">{company.count}</span>
                        </div>
                        <ProgressBar 
                          now={(company.count / topCompaniesByCount[0].count) * 100} 
                          variant="primary" 
                          style={{ height: '8px' }} 
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No internship count data available</p>
                )}
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
      
      <div className="filters-container row mb-4">
        <div className="col-md-4">
          <Form.Group>
            <Form.Label>Filter by Status</Form.Label>
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
        </div>
        
        <div className="col-md-4">
          <Form.Group>
            <Form.Label>Filter by Major</Form.Label>
            <Form.Select 
              value={majorFilter}
              onChange={(e) => setMajorFilter(e.target.value)}
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
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>        <div className="mb-4">
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
                    <td>{formatDate(report.submissionDate)}</td>
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
            <p>There are no finalized submitted reports from students yet.</p>
          </div>
        )}      </div>

      {/* Details Modal for reports and evaluations */}
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
              </div>              <div className="detail-header">
                <span className="detail-label">Submitted on:</span> {formatDate(selectedItem?.submissionDate)}
              </div>
                <div className="detail-header">
                <span className="detail-label">Status:</span>
                {selectedItem?.status === 'pending' && <Badge bg="warning" text="dark" className="ms-2">Pending</Badge>}
                {selectedItem?.status === 'accepted' && <Badge bg="success" className="ms-2">Accepted</Badge>}
                {selectedItem?.status === 'rejected' && <Badge bg="danger" className="ms-2">Rejected</Badge>}
                {selectedItem?.status === 'flagged' && <Badge bg="info" className="ms-2">Flagged</Badge>}
                {!selectedItem?.status && <Badge bg="warning" text="dark" className="ms-2">Pending</Badge>}
                <small className="d-block text-muted mt-1">
                  (Only Faculty academics can change report status)
                </small>
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
                      {selectedItem.evaluationText}
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ScadReportsPage;
