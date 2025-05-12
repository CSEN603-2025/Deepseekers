import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Badge, ListGroup } from 'react-bootstrap';

const StudentAssessmentsPage = () => {
  const [assessments, setAssessments] = useState([
    {
      id: 1,
      title: 'Technical Skills Assessment',
      description: 'Evaluate your programming and technical abilities',
      status: 'available'
    },
    {
      id: 2,
      title: 'Professional Development Assessment',
      description: 'Evaluate your soft skills and career readiness',
      status: 'available'
    },
    {
      id: 3,
      title: 'Industry Knowledge Assessment',
      description: 'Test your knowledge of industry standards and practices',
      status: 'available'
    }
  ]);
  
  const [completedAssessments, setCompletedAssessments] = useState([]);
  
  useEffect(() => {
    // Load completed assessments from localStorage if available
    const savedAssessments = localStorage.getItem('completedAssessments');
    if (savedAssessments) {
      setCompletedAssessments(JSON.parse(savedAssessments));
    }
  }, []);
  
  const takeAssessment = (assessmentId) => {
    // This would normally navigate to the assessment
    alert(`Taking assessment ${assessmentId}`);
  };

  return (
    <Container className="py-4">
      <h4 className="mb-4">Student Assessments</h4>
      
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header as="h5">Available Assessments</Card.Header>
            <ListGroup variant="flush">
              {assessments.map(assessment => (
                <ListGroup.Item key={assessment.id} className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">{assessment.title}</h6>
                    <small className="text-muted">{assessment.description}</small>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline-primary"
                    onClick={() => takeAssessment(assessment.id)}
                  >
                    Take Assessment
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Header as="h5">Completed Assessments</Card.Header>
            <Card.Body>
              {completedAssessments.length > 0 ? (
                <ListGroup variant="flush">
                  {completedAssessments.map(assessment => (
                    <ListGroup.Item key={assessment.id}>
                      <h6 className="mb-1">{assessment.title}</h6>
                      <Badge bg="success">Score: {assessment.score}%</Badge>
                      <small className="d-block text-muted mt-1">
                        Completed on {new Date(assessment.completedDate).toLocaleDateString()}
                      </small>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-muted">You haven't completed any assessments yet.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentAssessmentsPage;