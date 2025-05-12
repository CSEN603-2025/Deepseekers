import React, { useState, useEffect } from 'react';
import { students as defaultStudents, companies as allCompanies } from '../Data/UserData';
import { Container, Row, Col, Card, Badge, Form, Button, Modal, Table } from 'react-bootstrap';
import '../css/FacultyReportsPage.css'; // Reusing the existing faculty styles

function FacultyEvaluationsPage() {
  const [students, setStudents] = useState([]);
  const [companyEvaluations, setCompanyEvaluations] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  useEffect(() => {
    // Load all necessary data from localStorage
    loadUserData();
  }, []);
  
  const loadUserData = () => {
    // Load students data
    const savedStudents = localStorage.getItem('users') || '[]';
    let parsedStudents = JSON.parse(savedStudents).filter(user => user.role === 'student');
    
    // If no students in localStorage, use default students from UserData.js
    if (parsedStudents.length === 0) {
      parsedStudents = defaultStudents;
    }
    
    setStudents(parsedStudents);
    
    // Load students data
    
    // Load company evaluations about students
    loadCompanyEvaluations(parsedStudents);
  };

  const loadCompanyEvaluations = (parsedStudents) => {
    console.log('Loading company evaluations...');
    const savedCompanyEvals = localStorage.getItem('CompanyEvaluations') || '[]';
    console.log('Raw company evaluations from localStorage:', savedCompanyEvals);
    const companyEvals = JSON.parse(savedCompanyEvals);
    console.log('Parsed company evaluations:', companyEvals);
    
    // If no evaluations exist, add sample data for testing
    if (companyEvals.length === 0) {
      console.log('No evaluations found, adding sample data');
      const sampleEvaluations = [
        {
          studentId: 1,
          internshipId: 1,
          companyId: 1,
          evaluationText: "Muhamed demonstrated excellent problem-solving skills during his internship. He quickly adapted to our development environment and contributed valuable code to our projects. His communication skills were also commendable.",
          rating: 5,
          date: new Date().toISOString(),
          studentName: "Muhamed Amer",
          internshipTitle: "Software Developer Intern",
          supervisorId: 1,
          supervisorName: "John Smith",
          supervisorPosition: "Senior Developer",
          internshipStartDate: new Date('2025-01-15').toISOString(),
          internshipEndDate: new Date('2025-04-15').toISOString()
        },
        {
          studentId: 2,
          internshipId: 2,
          companyId: 2,
          evaluationText: "Sarah performed well in her data analysis role. She showed strong analytical skills and attention to detail. There's room for improvement in her presentation skills, but overall she was a valuable addition to the team.",
          rating: 4,
          date: new Date().toISOString(),
          studentName: "Sarah Johnson",
          internshipTitle: "Data Analyst Intern",
          supervisorId: 2,
          supervisorName: "Emily Chen",
          supervisorPosition: "Analytics Manager",
          internshipStartDate: new Date('2025-02-01').toISOString(),
          internshipEndDate: new Date('2025-05-01').toISOString()
        }
      ];
      
      // Save sample data to localStorage
      localStorage.setItem('CompanyEvaluations', JSON.stringify(sampleEvaluations));
      companyEvals.push(...sampleEvaluations);
    }
    
    // Enrich with student and company names
    const enrichedEvals = companyEvals.map(evaluation => {
      // Find student info from parsedStudents
      const student = parsedStudents.find(s => s.id === evaluation.studentId);
      
      return {
        ...evaluation,
        studentName: student ? student.name : 'Unknown Student',
        studentMajor: student ? student.major : 'Unknown Major',
        formattedStartDate: formatDate(evaluation.internshipStartDate),
        formattedEndDate: formatDate(evaluation.internshipEndDate),
        formattedEvaluationDate: formatDate(evaluation.date)
      };
    });
    
    setCompanyEvaluations(enrichedEvals);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleViewDetails = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowDetailsModal(true);
  };



  // Get company name by ID
  const getCompanyName = (companyId) => {
    // Try to get company name from localStorage first
    const savedCompanies = localStorage.getItem('companies') || '[]';
    const companies = JSON.parse(savedCompanies);
    const company = companies.find(c => c.id === companyId);
    
    if (company) return company.name;
    
    // Fallback to imported companies if not found
    const fallbackCompany = allCompanies.find(c => c.id === companyId);
    return fallbackCompany ? fallbackCompany.name : 'Unknown Company';
  };

  // Get rating stars display
  const getRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<i key={i} className="fas fa-star text-warning"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star text-warning"></i>);
      }
    }
    return stars;
  };

  return (
    <Container className="faculty-reports-container">
      <div className="page-header">
        <h2 className="page-title">Student Evaluations</h2>
        <p className="page-description">
          View evaluations submitted by companies for students who completed internships.
        </p>
      </div>
      

      
      {/* Evaluations List */}
      <h4>Company Evaluations of Students</h4>
      
      {companyEvaluations.length > 0 ? (
        <Row>
          {companyEvaluations.map((evaluation, index) => (
            <Col md={6} lg={4} key={index} className="mb-4">
              <Card className="evaluation-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">{evaluation.studentName}</h5>
                    <Badge bg="primary" className="company-badge">
                      {getCompanyName(evaluation.companyId)}
                    </Badge>
                  </div>
                  
                  <p className="position-title">{evaluation.internshipTitle}</p>
                  
                  <div className="rating-stars mb-2">
                    {getRatingStars(evaluation.rating)}
                  </div>
                  
                  <div className="evaluation-dates mb-2">
                    <small>
                      <strong>Internship Period:</strong> {evaluation.formattedStartDate} - {evaluation.formattedEndDate}
                    </small>
                  </div>
                  
                  <div className="evaluation-preview">
                    <p className="text-truncate-3">
                      {evaluation.evaluationText}
                    </p>
                  </div>
                  
                  <div className="evaluation-meta mt-3">
                    <small className="text-muted">
                      <strong>Supervisor:</strong> {evaluation.supervisorName}, {evaluation.supervisorPosition}
                    </small>
                  </div>
                  
                  <div className="mt-3 text-end">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleViewDetails(evaluation)}
                    >
                      View Details
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card className="text-center p-5">
          <Card.Body>
            <i className="fas fa-file-alt fa-3x mb-3 text-muted"></i>
            <h5>No Evaluations Found</h5>
            <p className="text-muted">
              There are no company evaluations matching your filter criteria.
            </p>
          </Card.Body>
        </Card>
      )}
      
      {/* Evaluation Details Modal */}
      <Modal 
        show={showDetailsModal} 
        onHide={() => setShowDetailsModal(false)}
        size="lg"
        centered
      >
        {selectedEvaluation && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>
                Student Evaluation Details
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="evaluation-header mb-4">
                <h4>{selectedEvaluation.studentName}</h4>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Badge bg="primary" className="me-2">
                      {getCompanyName(selectedEvaluation.companyId)}
                    </Badge>
                    <Badge bg="secondary">
                      {selectedEvaluation.internshipTitle}
                    </Badge>
                  </div>
                  <div className="rating-stars">
                    {getRatingStars(selectedEvaluation.rating)}
                  </div>
                </div>
              </div>
              
              <Table bordered className="mb-4">
                <tbody>
                  <tr>
                    <th width="30%">Student Major</th>
                    <td>{selectedEvaluation.studentMajor || 'Not specified'}</td>
                  </tr>
                  <tr>
                    <th>Internship Period</th>
                    <td>{selectedEvaluation.formattedStartDate} - {selectedEvaluation.formattedEndDate}</td>
                  </tr>
                  <tr>
                    <th>Supervisor</th>
                    <td>{selectedEvaluation.supervisorName}, {selectedEvaluation.supervisorPosition}</td>
                  </tr>
                  <tr>
                    <th>Evaluation Date</th>
                    <td>{selectedEvaluation.formattedEvaluationDate}</td>
                  </tr>
                </tbody>
              </Table>
              
              <div className="evaluation-content mb-4">
                <h5>Evaluation</h5>
                <Card className="p-3 bg-light">
                  <Card.Text style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedEvaluation.evaluationText}
                  </Card.Text>
                </Card>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Container>
  );
}

export default FacultyEvaluationsPage;