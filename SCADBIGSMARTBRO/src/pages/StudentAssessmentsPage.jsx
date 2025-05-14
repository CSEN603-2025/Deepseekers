import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Badge, Button, Modal, Form, ProgressBar } from 'react-bootstrap';
import '../css/StudentAssessments.css';

const StudentAssessmentsPage = () => {
  const [assessments, setAssessments] = useState([]);
  const [completedAssessments, setCompletedAssessments] = useState([]);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [shareOnProfile, setShareOnProfile] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Enhanced sample assessment data with more questions
  const sampleAssessments = [
    {
      id: 1,
      title: "JavaScript Fundamentals",
      description: "Test your knowledge of JavaScript basics including variables, functions, and control flow.",
      duration: "30 minutes",
      difficultyLevel: "Beginner",
      category: "Web Development",
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
        },
        {
          id: 4,
          question: "Which operator is used to assign a value to a variable?",
          options: ["=", "*", "x", "-"],
          correctAnswer: 0
        },
        {
          id: 5,
          question: "How do you write 'Hello World' in an alert box?",
          options: [
            "alertBox('Hello World');",
            "msg('Hello World');",
            "alert('Hello World');",
            "msgBox('Hello World');"
          ],
          correctAnswer: 2
        },
        {
          id: 6,
          question: "What is the correct way to write a JavaScript array?",
          options: [
            "var colors = ['red', 'green', 'blue']",
            "var colors = (1:'red', 2:'green', 3:'blue')",
            "var colors = 'red', 'green', 'blue'",
            "var colors = 1 = ('red'), 2 = ('green'), 3 = ('blue')"
          ],
          correctAnswer: 0
        },
        {
          id: 7,
          question: "How do you round the number 7.25, to the nearest integer?",
          options: ["Math.rnd(7.25)", "round(7.25)", "Math.round(7.25)", "rnd(7.25)"],
          correctAnswer: 2
        }
      ]
    },
    {
      id: 2,
      title: "React Basics",
      description: "Assess your understanding of React components, state, and props.",
      duration: "45 minutes",
      difficultyLevel: "Intermediate",
      category: "Web Development",
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
        },
        {
          id: 4,
          question: "What is a controlled component in React?",
          options: [
            "A component that controls other components",
            "A component that maintains its own state",
            "A component that has its form data controlled by React state",
            "A component that can't be modified by users"
          ],
          correctAnswer: 2
        },
        {
          id: 5,
          question: "Which of the following is used to pass data from child to parent component?",
          options: [
            "Passing a function as prop from parent to child",
            "Using global state",
            "Direct state manipulation",
            "Using React.parentMethod()"
          ],
          correctAnswer: 0
        },
        {
          id: 6,
          question: "What is the virtual DOM in React?",
          options: [
            "A complete copy of the real DOM",
            "A lightweight JavaScript representation of the DOM",
            "A virtual machine that runs JavaScript",
            "A browser extension for React development"
          ],
          correctAnswer: 1
        },
        {
          id: 7,
          question: "Which React hook is used for performing side effects?",
          options: ["useEffect", "useState", "useContext", "useReducer"],
          correctAnswer: 0
        },
        {
          id: 8,
          question: "What is the purpose of React fragments?",
          options: [
            "To split code into smaller parts",
            "To group multiple elements without adding extra nodes to the DOM",
            "To create standalone React components",
            "To optimize React rendering performance"
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
      difficultyLevel: "Advanced",
      category: "Database",
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
        },
        {
          id: 4,
          question: "Which of the following is not a type of database relationship?",
          options: ["One-to-One", "One-to-Many", "Many-to-Many", "All-to-All"],
          correctAnswer: 3
        },
        {
          id: 5,
          question: "What is normalization in database design?",
          options: [
            "Converting database to a standard format",
            "The process of organizing data to reduce redundancy",
            "Making all data entries uniform",
            "Transforming text data to numeric data"
          ],
          correctAnswer: 1
        },
        {
          id: 6,
          question: "Which SQL clause is used to filter records?",
          options: ["WHERE", "FILTER", "HAVING", "EXTRACT"],
          correctAnswer: 0
        },
        {
          id: 7,
          question: "What is a foreign key in a database?",
          options: [
            "A key from another country's database",
            "A field that uniquely identifies each record in a table",
            "A field that links to the primary key of another table",
            "An encryption key for secure database access"
          ],
          correctAnswer: 2
        },
        {
          id: 8,
          question: "What is a NoSQL database?",
          options: [
            "A database that doesn't require SQL for queries",
            "A database that uses non-standard query language",
            "A database that doesn't use structured query formats or table schemas",
            "A database that can't perform SQL-like operations"
          ],
          correctAnswer: 2
        },
        {
          id: 9,
          question: "Which of the following is an example of a NoSQL database?",
          options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"],
          correctAnswer: 2
        }
      ]
    },
    {
      id: 4,
      title: "Mobile App Development",
      description: "Test your knowledge of app development concepts, frameworks, and best practices.",
      duration: "35 minutes",
      difficultyLevel: "Intermediate",
      category: "Mobile Development",
      questions: [
        {
          id: 1,
          question: "Which of these is not a mobile development framework/platform?",
          options: ["React Native", "Flutter", "MobiLang", "Xamarin"],
          correctAnswer: 2
        },
        {
          id: 2,
          question: "What language is primarily used for native Android development?",
          options: ["Swift", "Java/Kotlin", "Objective-C", "C#"],
          correctAnswer: 1
        },
        {
          id: 3,
          question: "What is the main benefit of cross-platform mobile development frameworks?",
          options: [
            "Better performance than native apps",
            "Access to more device features",
            "Sharing code across multiple platforms",
            "Simpler app submission process"
          ],
          correctAnswer: 2
        },
        {
          id: 4,
          question: "What is the purpose of a mobile app manifest file?",
          options: [
            "To list all developers who worked on the app",
            "To manifest the app's existence to the universe",
            "To declare app requirements, permissions, and capabilities",
            "To list all external libraries used in the app"
          ],
          correctAnswer: 2
        },
        {
          id: 5,
          question: "What programming language is Flutter based on?",
          options: ["JavaScript", "Java", "Dart", "C++"],
          correctAnswer: 2
        },
        {
          id: 6,
          question: "What is a key advantage of React Native over other frameworks?",
          options: [
            "It's owned by Facebook/Meta",
            "It uses native components for better UI performance",
            "It only requires knowledge of CSS",
            "It's the newest framework available"
          ],
          correctAnswer: 1
        },
        {
          id: 7,
          question: "What is the main purpose of responsive design in mobile apps?",
          options: [
            "To make apps respond quickly to user input",
            "To ensure apps adapt to different screen sizes and orientations",
            "To make apps respond to voice commands",
            "To ensure apps can respond to network changes"
          ],
          correctAnswer: 1
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
    setCurrentQuestionIndex(0);
    setShowAssessmentModal(true);
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentAssessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
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
      assessmentCategory: currentAssessment.category,
      assessmentDifficulty: currentAssessment.difficultyLevel,
      score: calculatedScore,
      completionDate: new Date().toISOString(),
      studentId: currentUser?.id,
      sharedOnProfile: shareOnProfile
    };

    const updatedCompletedAssessments = [...completedAssessments, newCompletedAssessment];
    setCompletedAssessments(updatedCompletedAssessments);
    localStorage.setItem('completedAssessments', JSON.stringify(updatedCompletedAssessments));
  };

  // Add function to toggle sharing status
  const handleToggleSharing = (assessmentId, isShared) => {
    const updatedAssessments = completedAssessments.map(assessment => 
      assessment.id === assessmentId 
        ? { ...assessment, sharedOnProfile: isShared }
        : assessment
    );
    
    setCompletedAssessments(updatedAssessments);
    localStorage.setItem('completedAssessments', JSON.stringify(updatedAssessments));
  };

  const handleCloseModal = () => {
    setShowAssessmentModal(false);
    setCurrentAssessment(null);
    setScore(null);
    setCurrentQuestionIndex(0);
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

  // Progress calculation for current assessment
  const getAssessmentProgress = () => {
    if (!currentAssessment) return 0;
    const answeredQuestions = Object.keys(answers).length;
    return Math.round((answeredQuestions / currentAssessment.questions.length) * 100);
  };

  // Check if current question has been answered (fixed to correctly check answer existence)
  const isCurrentQuestionAnswered = () => {
    if (!currentAssessment) return false;
    const currentQuestion = currentAssessment.questions[currentQuestionIndex];
    return answers[currentQuestion.id] !== undefined;
  };

  return (
    <Container fluid className="student-assessments-page py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="page-title">Professional Skills Assessments</h2>
          <p className="text-muted">Test your knowledge and earn certificates to showcase your skills to potential employers</p>
        </Col>
      </Row>
      
      <Row className="mb-5">
        <Col md={12}>
          <Card className="available-assessments-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <h4>Available Assessments</h4>
                <p className="text-muted mb-0">Select an assessment to test your skills</p>
              </div>
            </Card.Header>
            <ListGroup variant="flush">
              {assessments.map(assessment => (
                <ListGroup.Item key={assessment.id} className="assessment-item">
                  <Row>
                    <Col md={7}>
                      <h5 className="assessment-title">{assessment.title}</h5>
                      <p className="assessment-description">{assessment.description}</p>
                      <div className="assessment-meta">
                        <Badge bg="info" className="me-2">{assessment.questions.length} Questions</Badge>
                        <Badge bg="secondary" className="me-2">{assessment.duration}</Badge>
                        <Badge 
                          bg={
                            assessment.difficultyLevel === 'Beginner' ? 'success' : 
                            assessment.difficultyLevel === 'Intermediate' ? 'warning' : 'danger'
                          }
                          className="me-2"
                        >
                          {assessment.difficultyLevel}
                        </Badge>
                        <Badge bg="light" text="dark">{assessment.category}</Badge>
                      </div>
                    </Col>
                    <Col md={5} className="d-flex align-items-center justify-content-end">
                      <Button 
                        variant="primary" 
                        onClick={() => handleStartAssessment(assessment)}
                        className="start-assessment-btn"
                      >
                        <i className="bi bi-play-circle me-2"></i>
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
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <h4>My Assessment Results</h4>
                <p className="text-muted mb-0">View your past assessment scores and certificates</p>
              </div>
            </Card.Header>
            {userCompletedAssessments.length > 0 ? (
              <ListGroup variant="flush">
                {userCompletedAssessments.map(assessment => (
                  <ListGroup.Item key={assessment.id} className="completed-assessment-item">
                    <Row>
                      <Col md={6}>
                        <h5 className="assessment-title">{assessment.assessmentTitle}</h5>
                        <div className="d-flex align-items-center flex-wrap">
                          <p className="completion-date mb-0 me-3">
                            <i className="bi bi-calendar3 me-1"></i>
                            {formatDate(assessment.completionDate)}
                          </p>
                          {assessment.assessmentCategory && (
                            <Badge bg="light" text="dark" className="me-2">
                              {assessment.assessmentCategory}
                            </Badge>
                          )}
                          {assessment.assessmentDifficulty && (
                            <Badge 
                              bg={
                                assessment.assessmentDifficulty === 'Beginner' ? 'success' : 
                                assessment.assessmentDifficulty === 'Intermediate' ? 'warning' : 'danger'
                              }
                            >
                              {assessment.assessmentDifficulty}
                            </Badge>
                          )}
                        </div>
                      </Col>
                      <Col md={4} className="d-flex align-items-center justify-content-center">
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
                      <Col md={2} className="d-flex align-items-center justify-content-end">
                        <div className="actions-container">
                          <div className="share-toggle-wrapper mb-2">
                            <Button
                              variant={assessment.sharedOnProfile ? "outline-info" : "outline-secondary"}
                              size="sm"
                              className="share-button"
                              onClick={() => handleToggleSharing(assessment.id, !assessment.sharedOnProfile)}
                            >
                              {assessment.sharedOnProfile ? (
                                <>
                                  <i className="bi bi-eye-fill me-1"></i> Share
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-eye-slash me-1"></i> Shared
                                </>
                              )}
                            </Button>
                          </div>
                          {assessment.score >= 70 && (
                            <Button variant="outline-primary" size="sm" className="certificate-btn">
                              <i className="bi bi-award me-1"></i> Certificate
                            </Button>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <Card.Body className="text-center py-5">
                <div className="empty-state">
                  <i className="bi bi-journal-text empty-icon"></i>
                  <h5>No Completed Assessments</h5>
                  <p className="mb-0">You haven't completed any assessments yet.</p>
                  <p>Start an assessment from the list above to test your skills.</p>
                </div>
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
              <div className="assessment-progress mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Question {currentQuestionIndex + 1} of {currentAssessment.questions.length}</span>
                  <span>{getAssessmentProgress()}% Complete</span>
                </div>
                <ProgressBar 
                  now={((currentQuestionIndex + 1) / currentAssessment.questions.length) * 100} 
                  variant="info" 
                />
              </div>

              <div className="current-question">
                {currentAssessment.questions.map((question, index) => (
                  <div 
                    key={question.id} 
                    className={`assessment-question ${index === currentQuestionIndex ? 'd-block' : 'd-none'}`}
                  >
                    <h5>{question.question}</h5>
                    <div className="options-container mt-4">
                      {question.options.map((option, optionIndex) => (
                        <div 
                          key={optionIndex}
                          className={`option-card ${answers[question.id] === optionIndex ? 'selected' : ''}`}
                          onClick={() => handleAnswerSelect(question.id, optionIndex)}
                        >
                          <div className="option-indicator">
                            {String.fromCharCode(65 + optionIndex)}
                          </div>
                          <div className="option-content">
                            {option}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="question-navigation d-flex justify-content-between mt-4">
                <Button 
                  variant="outline-secondary" 
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Previous
                </Button>
                {currentQuestionIndex < currentAssessment.questions.length - 1 ? (
                  <Button 
                    variant="primary" 
                    onClick={handleNextQuestion}
                    disabled={!isCurrentQuestionAnswered()}
                  >
                    Next
                    <i className="bi bi-arrow-right ms-2"></i>
                  </Button>
                ) : (
                  <Button 
                    variant="success" 
                    onClick={handleSubmitAssessment}
                    disabled={Object.keys(answers).length < currentAssessment.questions.length}
                  >
                    Submit Assessment
                  </Button>
                )}
              </div>
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
                {score >= 70 && (
                  <Button variant="primary" className="certificate-btn-lg mt-2">
                    <i className="bi bi-award me-2"></i>
                    Download Certificate
                  </Button>
                )}
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
        <Modal.Footer className="d-flex justify-content-between align-items-center">
          {score !== null && (
            <>
              <div className="share-toggle-container">
                <div className="sharing-button-wrapper">
                  <Button 
                    variant={shareOnProfile ? "primary" : "outline-primary"} 
                    className="share-profile-btn"
                    onClick={() => setShareOnProfile(!shareOnProfile)}
                  >
                    <i className={`bi ${shareOnProfile ? 'bi-eye' : 'bi-eye-slash'} me-2`}></i>
                    {shareOnProfile ? 'Visible on Profile' : 'Hidden from Profile'}
                  </Button>
                </div>
              </div>
              <Button variant="secondary" onClick={handleCloseModal}>
                Close
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StudentAssessmentsPage;