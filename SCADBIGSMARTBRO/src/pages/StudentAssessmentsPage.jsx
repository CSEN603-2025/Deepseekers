import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Badge, Button, Modal, Form } from 'react-bootstrap';
import '../css/StudentAssessments.css';

const StudentAssessmentsPage = () => {
  const [assessments, setAssessments] = useState([]);
  const [completedAssessments, setCompletedAssessments] = useState([]);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Sample assessment data - in a real app, this would come from an API or database
  const sampleAssessments = [
    {
      id: 1,
      title: "JavaScript Fundamentals",
      description: "Test your knowledge of JavaScript basics including variables, functions, and control flow.",
      duration: "30 minutes",
      questions: [
        {
          id: 1,
          question: "What is the correct way to declare a variable in JavaScript?",
          options: ["var x = 5;", "variable x = 5;", "x := 5;", "int x = 5;"],
          correctAnswer: 0
        },
        {
          id: 2,
          question: "Which of the following is not a JavaScript data type?",
          options: ["String", "Boolean", "Integer", "Object"],
          correctAnswer: 2
        },
        {
          id: 3,
          question: "How do you create a function in JavaScript?",
          options: [
            "function myFunction() {}", 
            "create function myFunction() {}", 
            "function:myFunction() {}", 
            "function = myFunction() {}"
          ],
          correctAnswer: 0
        }
      ]
    },
    {
      id: 2,
      title: "React Basics",
      description: "Assess your understanding of React components, state, and props.",
      duration: "45 minutes",
      questions: [
        {
          id: 1,
          question: "What is JSX in React?",
          options: [
            "JavaScript XML - A syntax extension for JavaScript", 
            "JavaScript Extra - A library for DOM manipulation", 
            "JavaScript Extension - A tool for API calls", 
            "JavaScript XHR - A method for AJAX requests"
          ],
          correctAnswer: 0
        },
        {
          id: 2,
          question: "How do you update state in a React functional component?",
          options: [
            "this.state = newState", 
            "setState(newState)", 
            "Using the useState hook", 
            "state.update(newState)"
          ],
          correctAnswer: 2
        },
        {
          id: 3,
          question: "What is the correct way to pass data from a parent to a child component?",
          options: [
            "Using global variables", 
            "Using props", 
            "Using the context API only", 
            "Using state inheritance"
          ],
          correctAnswer: 1
        }
      ]
    },
    {
      id: 3,
      title: "Database Concepts",
      description: "Test your knowledge of database design, SQL, and data modeling.",
      duration: "40 minutes",
      questions: [
        {
          id: 1,
          question: "What is a primary key in a database?",
          options: [
            "A key that can be used to unlock the database", 
            "A unique identifier for a record in a table", 
            "The first column in any table", 
            "A password for database access"
          ],
          correctAnswer: 1
        },
        {
          id: 2,
          question: "Which SQL statement is used to retrieve data from a database?",
          options: ["SELECT", "RETRIEVE", "GET", "FETCH"],
          correctAnswer: 0
        },
        {
          id: 3,
          question: "What does ACID stand for in database transactions?",
          options: [
            "Atomicity, Consistency, Isolation, Durability", 
            "Aggregation, Concurrency, Integrity, Duplication", 
            "Authentication, Caching, Indexing, Deletion", 
            "Automation, Calculation, Insertion, Deletion"
          ],
          correctAnswer: 0
        }
      ]
    }
  ];

  useEffect(() => {
    // Get current user data
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      setCurrentUser(parsedUserData);
    }

    // In a real app, fetch assessments from an API
    setAssessments(sampleAssessments);

    // Load completed assessments from localStorage
    const savedCompletedAssessments = localStorage.getItem('completedAssessments');
    if (savedCompletedAssessments) {
      setCompletedAssessments(JSON.parse(savedCompletedAssessments));
    }
  }, []);

  const handleStartAssessment = (assessment) => {
    setCurrentAssessment(assessment);
    setAnswers({});
    setScore(null);
    setShowAssessmentModal(true);
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex
    });
  };

  const handleSubmitAssessment = () => {
    // Calculate score
    let correctAnswers = 0;
    currentAssessment.questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const totalQuestions = currentAssessment.questions.length;
    const calculatedScore = Math.round((correctAnswers / totalQuestions) * 100);
    setScore(calculatedScore);

    // Save completed assessment to localStorage
    const newCompletedAssessment = {
      id: Date.now(),
      assessmentId: currentAssessment.id,
      assessmentTitle: currentAssessment.title,
      score: calculatedScore,
      completionDate: new Date().toISOString(),
      studentId: currentUser?.id
    };

    const updatedCompletedAssessments = [...completedAssessments, newCompletedAssessment];
    setCompletedAssessments(updatedCompletedAssessments);
    localStorage.setItem('completedAssessments', JSON.stringify(updatedCompletedAssessments));
  };

  const handleCloseModal = () => {
    setShowAssessmentModal(false);
    setCurrentAssessment(null);
    setScore(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Filter completed assessments for the current user
  const userCompletedAssessments = completedAssessments.filter(
    assessment => assessment.studentId === currentUser?.id
  );

  return (
    <Container className="student-assessments-page py-4">
      <h2 className="mb-4">Online Assessments</h2>
      
      <Row className="mb-5">
        <Col md={12}>
          <Card className="available-assessments-card">
            <Card.Header>
              <h4>Available Assessments</h4>
              <p className="text-muted mb-0">Select an assessment to test your skills</p>
            </Card.Header>
            <ListGroup variant="flush">
              {assessments.map(assessment => (
                <ListGroup.Item key={assessment.id} className="assessment-item">
                  <Row>
                    <Col md={8}>
                      <h5 className="assessment-title">{assessment.title}</h5>
                      <p className="assessment-description">{assessment.description}</p>
                      <div className="assessment-meta">
                        <Badge bg="secondary">{assessment.questions.length} Questions</Badge>
                      </div>
                    </Col>
                    <Col md={4} className="d-flex align-items-center justify-content-end">
                      <Button 
                        variant="primary" 
                        onClick={() => handleStartAssessment(assessment)}
                        className="start-assessment-btn"
                      >
                        Start Assessment
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card className="completed-assessments-card">
            <Card.Header>
              <h4>My Assessment Results</h4>
              <p className="text-muted mb-0">View your past assessment scores</p>
            </Card.Header>
            {userCompletedAssessments.length > 0 ? (
              <ListGroup variant="flush">
                {userCompletedAssessments.map(assessment => (
                  <ListGroup.Item key={assessment.id} className="completed-assessment-item">
                    <Row>
                      <Col md={8}>
                        <h5 className="assessment-title">{assessment.assessmentTitle}</h5>
                        <p className="completion-date">Completed on: {formatDate(assessment.completionDate)}</p>
                      </Col>
                      <Col md={4} className="d-flex align-items-center justify-content-end">
                        <div className="score-container">
                          <div className={`score-circle ${
                            assessment.score >= 70 ? 'high-score' : 
                            assessment.score >= 40 ? 'medium-score' : 'low-score'
                          }`}>
                            {assessment.score}%
                          </div>
                          <span className="score-label">
                            {assessment.score >= 70 ? 'Excellent' : 
                             assessment.score >= 40 ? 'Good' : 'Needs Improvement'}
                          </span>
                        </div>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <Card.Body className="text-center py-5">
                <p className="mb-0">You haven't completed any assessments yet.</p>
                <p>Start an assessment from the list above to test your skills.</p>
              </Card.Body>
            )}
          </Card>
        </Col>
      </Row>

      {/* Assessment Modal */}
      <Modal 
        show={showAssessmentModal} 
        onHide={handleCloseModal}
        size="lg"
        centered
        backdrop="static"
        className="assessment-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {currentAssessment?.title}
            {score !== null && <span className="ms-2 text-muted">(Score: {score}%)</span>}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentAssessment && score === null && (
            <div className="assessment-questions">
              {currentAssessment.questions.map((question, index) => (
                <div key={question.id} className="assessment-question mb-4">
                  <h5>Question {index + 1}: {question.question}</h5>
                  <Form>
                    {question.options.map((option, optionIndex) => (
                      <Form.Check
                        key={optionIndex}
                        type="radio"
                        id={`question-${question.id}-option-${optionIndex}`}
                        label={option}
                        name={`question-${question.id}`}
                        checked={answers[question.id] === optionIndex}
                        onChange={() => handleAnswerSelect(question.id, optionIndex)}
                        className="mb-2"
                      />
                    ))}
                  </Form>
                </div>
              ))}
            </div>
          )}

          {score !== null && (
            <div className="assessment-results">
              <div className="text-center mb-4">
                <div className={`result-score-circle ${
                  score >= 70 ? 'high-score' : 
                  score >= 40 ? 'medium-score' : 'low-score'
                }`}>
                  {score}%
                </div>
                <h4 className="mt-3">
                  {score >= 70 ? 'Excellent Work!' : 
                   score >= 40 ? 'Good Job!' : 'Keep Practicing!'}
                </h4>
                <p className="text-muted">
                  {score >= 70 ? 'You have a strong understanding of this subject.' : 
                   score >= 40 ? 'You have a good grasp of the basics, but there\'s room for improvement.' : 
                   'You might want to review this subject more thoroughly.'}
                </p>
              </div>

              <div className="question-review">
                <h5 className="mb-3">Question Review:</h5>
                {currentAssessment.questions.map((question, index) => {
                  const isCorrect = answers[question.id] === question.correctAnswer;
                  return (
                    <div key={question.id} className={`review-question mb-3 ${isCorrect ? 'correct' : 'incorrect'}`}>
                      <p className="mb-1">
                        <strong>Question {index + 1}:</strong> {question.question}
                      </p>
                      <p className="mb-1">
                        <strong>Your answer:</strong> {question.options[answers[question.id]]}
                        {isCorrect ? 
                          <Badge bg="success" className="ms-2">Correct</Badge> : 
                          <Badge bg="danger" className="ms-2">Incorrect</Badge>
                        }
                      </p>
                      {!isCorrect && (
                        <p className="mb-0">
                          <strong>Correct answer:</strong> {question.options[question.correctAnswer]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {score === null ? (
            <Button variant="primary" onClick={handleSubmitAssessment}>
              Submit Assessment
            </Button>
          ) : (
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StudentAssessmentsPage;
