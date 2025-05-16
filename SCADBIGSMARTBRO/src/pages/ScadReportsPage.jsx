import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, Table, Form, ProgressBar } from 'react-bootstrap';
import { FaHourglassHalf, FaCheckCircle, FaTimesCircle, FaFlag, FaDownload } from 'react-icons/fa';
import '../css/StudentReportsPage.css'; // Shared styling for reports
import '../css/ScadReportsPage.css'; // Specific styling for SCAD reports page
import '../css/FacultyHomePage.css'; // Import the same styling used in FacultyHomePage
import { coursesByMajor, students as defaultStudents } from '../Data/UserData';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function ScadReportsPage() {
  const [students, setStudents] = useState([]);
  const [submittedReports, setSubmittedReports] = useState([]);
  const [companyEvaluations, setCompanyEvaluations] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // State for advanced statistics
  const [averageReviewTime, setAverageReviewTime] = useState(0);
  const [topCourses, setTopCourses] = useState([]);
  const [topRatedCompanies, setTopRatedCompanies] = useState([]);
  const [topCompaniesByCount, setTopCompaniesByCount] = useState([]);
  
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
    
    // 3. For each report, find matching evaluation if it exists
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
        submissionDate: report.submissionDate || report.date, // Ensure submissionDate is set
        reviewDate: report.reviewDate || null
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
      // Find student info from parsedStudents
      const student = parsedStudents.find(s => s.id === evaluation.studentId);
      return {
        ...evaluation,
        studentName: student ? student.name : 'Unknown Student',
        type: 'companyEvaluation' // Add type for consistent handling in UI
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

  // Add the download function
  // Add the function to handle PDF download
  const handleDownloadReport = (report) => {
    // Find the student details
    const student = students.find(s => s.id === report.studentId) || {
      name: report.studentName || 'Unknown Student',
      gucId: report.studentId || 'Unknown ID',
      major: 'Unknown Major',
      email: 'N/A'
    };
    
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Set document properties
    doc.setProperties({
      title: `${report.reportTitle || report.companyName} - Internship Report`,
      author: student.name,
      subject: 'Internship Report',
      keywords: 'internship, report, evaluation',
    });
    
    // Add title
    doc.setFontSize(22);
    doc.setTextColor(0, 102, 204);
    doc.text('Internship Report', 105, 20, { align: 'center' });
    
    // Add student information section
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Student Information', 20, 35);
    
    doc.setFontSize(11);
    doc.setTextColor(70, 70, 70);
    doc.text(`Name: ${student.name}`, 20, 45);
    doc.text(`ID: ${student.gucId}`, 20, 52);
    doc.text(`Major: ${student.major}`, 20, 59);
    doc.text(`Email: ${student.email || 'N/A'}`, 20, 66);
    
    // Add company info
    doc.setFontSize(16);
    doc.setTextColor(70, 70, 70);
    doc.text(`Company: ${report.companyName}`, 20, 80, { align: 'left' });
    
    // Add horizontal line
    doc.setDrawColor(220, 220, 220);
    doc.line(20, 85, 190, 85);
    
    // Start position for report content
    let yPosition = 95;
    
    // Matching the order in the modal - first company evaluation if exists
    if (report.hasEvaluation) {
      // Recommendation
      doc.setFontSize(12);
      doc.setTextColor(0, 102, 204);
      doc.text(`Recommend it to other interns: ${report.recommend ? 'YES' : 'NO'}`, 20, yPosition);
      yPosition += 10;
      
      // Evaluation Text
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 204);
      doc.text('My Evaluation to the company', 20, yPosition);
      yPosition += 7;
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      
      const evalLines = doc.splitTextToSize(report.evaluationText, 170);
      doc.text(evalLines, 20, yPosition);
      yPosition += (evalLines.length * 5) + 15;
    }
    
    // Report Introduction (if exists)
    if (report.introduction) {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 204);
      doc.text('Introduction', 20, yPosition);
      yPosition += 7;
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      
      const introLines = doc.splitTextToSize(report.introduction, 170);
      doc.text(introLines, 20, yPosition);
      yPosition += (introLines.length * 5) + 15;
    }
    
    // Report Body
    if (report.body) {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 204);
      doc.text('Body', 20, yPosition);
      yPosition += 7;
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      
      const bodyLines = doc.splitTextToSize(report.body, 170);
      doc.text(bodyLines, 20, yPosition);
      yPosition += (bodyLines.length * 5) + 15;
    }
    
    // Helpful Courses (if exists)
    if (report.helpfulCourses?.length > 0) {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 204);
      doc.text('Helpful Courses', 20, yPosition);
      yPosition += 7;
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      
      const courseNames = getCourseNames(report.helpfulCourses, report.studentId);
      courseNames.forEach(course => {
        doc.text(`• ${course}`, 20, yPosition);
        yPosition += 6;
      });
    }
    
    // Add footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    }
    
    // Save the PDF with a filename based on the student and company
    doc.save(`${student.name.replace(/\s+/g, '_')}_${report.companyName.replace(/\s+/g, '_')}_Report.pdf`);
  };

  return (
    <Container className="faculty-reports-container mt-4">
      <h2 className="page-title">Student Reports & Company Evaluations</h2>
      <p className="page-description">
        View submitted student reports and company evaluations in a consolidated view.
      </p>
      
      {/* Statistics Dashboard */}
      <div className="statistics-dashboard mb-4">
        <h4 className="dashboard-title">Report Statistics</h4>
        <Row className="analytics-container">
          <Col md={3} sm={6} className="mb-3">
            <div className="analytics-card">
              <div className="analytics-icon icon-pending">
                <FaHourglassHalf />
              </div>
              <div className="analytics-value">{submittedReports.filter(r => r.status === 'pending').length}</div>
              <div className="analytics-label">Pending Reports</div>
            </div>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <div className="analytics-card">
              <div className="analytics-icon icon-accepted">
                <FaCheckCircle />
              </div>
              <div className="analytics-value">{submittedReports.filter(r => r.status === 'accepted').length}</div>
              <div className="analytics-label">Accepted Reports</div>
            </div>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <div className="analytics-card">
              <div className="analytics-icon icon-rejected">
                <FaTimesCircle />
              </div>
              <div className="analytics-value">{submittedReports.filter(r => r.status === 'rejected').length}</div>
              <div className="analytics-label">Rejected Reports</div>
            </div>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <div className="analytics-card">
              <div className="analytics-icon icon-flagged">
                <FaFlag />
              </div>
              <div className="analytics-value">{submittedReports.filter(r => r.status === 'flagged').length}</div>
              <div className="analytics-label">Flagged Reports</div>
            </div>
          </Col>
        </Row>
        
        {/* Advanced Statistics */}
        <h4 className="advanced-analytics-title mt-4">Advanced Analytics</h4>
        <Row>
          {/* Average Review Time */}
          <Col md={6} lg={3} className="mb-3">
            <div className="analytics-box">
              <div className="analytics-box-title">Average Review Time</div>
              <div className="analytics-value-large">{averageReviewTime.toFixed(1)} hours</div>
              <div className="analytics-subtitle">
                Based on {submittedReports.filter(r => r.reviewDate && r.submissionDate).length} reviewed reports
              </div>
            </div>
          </Col>
          
          {/* Most Frequently Used Courses */}
          <Col md={6} lg={3} className="mb-3">
            <div className="analytics-box">
              <div className="analytics-box-title">Most Used Courses in Internships</div>
              {topCourses.length > 0 ? (
                <div>
                  {topCourses.slice(0, 4).map((course, index) => (
                    <div key={index} className="analytics-item">
                      <div className="analytics-item-header">
                        <span>{course.name}</span>
                        <span className="analytics-badge bg-info">{course.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="analytics-subtitle">No course data available</div>
              )}
            </div>
          </Col>
          
          {/* Top Rated Companies */}
          <Col md={6} lg={3} className="mb-3">
            <div className="analytics-box">
              <div className="analytics-box-title">Top Rated Companies</div>
              {topRatedCompanies.length > 0 ? (
                <div>
                  {topRatedCompanies.slice(0, 4).map((company, index) => (
                    <div key={index} className="analytics-item">
                      <div className="analytics-item-header">
                        <span>{company.name}</span>
                        <span className="analytics-badge bg-success">
                          {(company.rating * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="analytics-subtitle">No company ratings available</div>
              )}
            </div>
          </Col>
          
          {/* Top Companies by Internship Count */}
          <Col md={6} lg={3} className="mb-3">
            <div className="analytics-box">
              <div className="analytics-box-title">Top Companies by Internship Count</div>
              {topCompaniesByCount.length > 0 ? (
                <div>
                  {topCompaniesByCount.slice(0, 4).map((company, index) => (
                    <div key={index} className="analytics-item">
                      <div className="analytics-item-header">
                        <span>{company.name}</span>
                        <span className="analytics-badge bg-primary">{company.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="analytics-subtitle">No internship count data available</div>
              )}
            </div>
          </Col>
        </Row>
        
        <div className="text-end mt-2">
          <Button className="btn-primary" onClick={() => window.print()}>
            Generate Report
          </Button>
        </div>
      </div>
      
      {/* Advanced Filters */}
      <div className="filter-container row">
        <div className="col-md-4">
          <Form.Group>
            <Form.Label className="filter-label">Filter by Status</Form.Label>
            <Form.Select 
              className="filter-select"
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
            <Form.Label className="filter-label">Filter by Major</Form.Label>
            <Form.Select 
              className="filter-select"
              value={majorFilter}
              onChange={(e) => {
                setMajorFilter(e.target.value);
                // Refresh will happen via useEffect
              }}
            >
              <option value="all">All Majors</option>
              {availableMajors.map((major, index) => (
                <option key={index} value={major}>{major}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>
        
        <div className="col-md-4 d-flex align-items-end">
          <Button 
            className="btn-secondary mb-3"
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
                      {report.status === 'pending' && <Badge className="badge-pending">Pending</Badge>}
                      {report.status === 'accepted' && <Badge className="badge-accepted">Accepted</Badge>}
                      {report.status === 'rejected' && <Badge className="badge-rejected">Rejected</Badge>}
                      {report.status === 'flagged' && <Badge className="badge-flagged">Flagged</Badge>}
                      {!report.status && <Badge className="badge-pending">Pending</Badge>}
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
                          className="btn-primary me-1"
                          onClick={() => handleViewDetails(report, 'report')}
                        >
                          View Student's Report
                        </Button>
                        
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleDownloadReport(report)}
                          className="me-1"
                          title="Download Report"
                        >
                          <FaDownload />
                        </Button>
                        
                        {matchingEval && (
                          <Button 
                            className="btn-secondary"
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
