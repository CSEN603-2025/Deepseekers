import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

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
      <h2 className="mb-4">Faculty Academic Dashboard</h2>
      
      {currentUser && (
        <div className="mb-4">
          <h4>Welcome, {currentUser.name}</h4>
          <p>Department: {currentUser.department}</p>
        </div>
      )}
      
      <Row className="mb-4">
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Header as="h5" style={{ backgroundColor: '#003b73', color: 'white' }}>Internship Reports Overview</Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="mb-3">
                  <Card className="text-center h-100" style={{ borderColor: '#003b73' }}>
                    <Card.Body>
                      <h3 style={{ color: '#003b73' }}>{reportStats.pending}</h3>
                      <p className="mb-0">Pending Reports</p>
                    </Card.Body>

                  </Card>
                </Col>
                
                <Col md={3} className="mb-3">
                  <Card className="text-center h-100" style={{ borderColor: '#003b73' }}>
                    <Card.Body>
                      <h3 style={{ color: '#003b73' }}>{reportStats.accepted}</h3>
                      <p className="mb-0">Accepted Reports</p>
                    </Card.Body>

                  </Card>
                </Col>
                
                <Col md={3} className="mb-3">
                  <Card className="text-center h-100" style={{ borderColor: '#003b73' }}>
                    <Card.Body>
                      <h3 style={{ color: '#003b73' }}>{reportStats.rejected}</h3>
                      <p className="mb-0">Rejected Reports</p>
                    </Card.Body>

                  </Card>
                </Col>
                
                <Col md={3} className="mb-3">
                  <Card className="text-center h-100" style={{ borderColor: '#003b73' }}>
                    <Card.Body>
                      <h3 style={{ color: '#003b73' }}>{reportStats.flagged}</h3>
                      <p className="mb-0">Flagged Reports</p>
                    </Card.Body>

                  </Card>
                </Col>
              </Row>
              
              <div className="text-center mt-3">
                <Link to="/faculty/reports" className="btn" style={{ backgroundColor: '#003b73', color: 'white' }}>
                  View All Reports
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Faculty Resources section removed */}
    </Container>
  );
}

export default FacultyHomePage;