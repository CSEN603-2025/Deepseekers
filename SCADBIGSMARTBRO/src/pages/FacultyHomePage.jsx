import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHourglassHalf, FaCheckCircle, FaTimesCircle, FaFlag } from 'react-icons/fa';
import '../css/FacultyHomePage.css';

function FacultyHomePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [reportStats, setReportStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    flagged: 0
  });

  useEffect(() => {
    // Load current user
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    
    // Load report statistics
    loadReportStats();
  }, []);

  const loadReportStats = () => {
    const savedReports = localStorage.getItem('internshipReports') || '[]';
    const reports = JSON.parse(savedReports);
    
    // Filter only submitted reports
    const submittedReports = reports.filter(report => report.isSubmitted === true);
    
    // Count reports by status
    const stats = {
      total: submittedReports.length,
      pending: submittedReports.filter(report => !report.status || report.status === 'pending').length,
      accepted: submittedReports.filter(report => report.status === 'accepted').length,
      rejected: submittedReports.filter(report => report.status === 'rejected').length,
      flagged: submittedReports.filter(report => report.status === 'flagged').length
    };
    
    setReportStats(stats);
  };

  return (
    <Container className="mt-4">
      
      {currentUser && (
        <div className="mb-4">
          <h4>Welcome, {currentUser.name}</h4>
          <p>Department: {currentUser.department}</p>
        </div>
      )}
      
      <h4 className="dashboard-title">Internship Reports Overview</h4>
      <Row className="analytics-container">
        <Col md={3} className="mb-3">
          <div className="analytics-card">
            <div className="analytics-icon icon-pending">
              <FaHourglassHalf />
            </div>
            <div className="analytics-value">{reportStats.pending}</div>
            <div className="analytics-label">Pending Reports</div>

          </div>
        </Col>
        
        <Col md={3} className="mb-3">
          <div className="analytics-card">
            <div className="analytics-icon icon-accepted">
              <FaCheckCircle />
            </div>
            <div className="analytics-value">{reportStats.accepted}</div>
            <div className="analytics-label">Accepted Reports</div>

          </div>
        </Col>
        
        <Col md={3} className="mb-3">
          <div className="analytics-card">
            <div className="analytics-icon icon-rejected">
              <FaTimesCircle />
            </div>
            <div className="analytics-value">{reportStats.rejected}</div>
            <div className="analytics-label">Rejected Reports</div>

          </div>
        </Col>
        
        <Col md={3} className="mb-3">
          <div className="analytics-card">
            <div className="analytics-icon icon-flagged">
              <FaFlag />
            </div>
            <div className="analytics-value">{reportStats.flagged}</div>
            <div className="analytics-label">Flagged Reports</div>

          </div>
        </Col>
      </Row>
      
      <div className="text-center mb-4">
        <Link to="/faculty/reports" className="btn view-all-btn" style={{ backgroundColor: '#003b73', color: 'white' }}>
          View All Reports
        </Link>
      </div>
    </Container>
  );
}

export default FacultyHomePage;