import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Modal,
  Form,
  Alert,
} from "react-bootstrap";
import "../css/StudentReportsPage.css";
import { coursesByMajor } from "../Data/UserData";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function StudentReportsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [finalizedReports, setFinalizedReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [appealMessage, setAppealMessage] = useState("");
  const [appealText, setAppealText] = useState("");

  // Filter state
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    // Get current user
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }

    // Load evaluations and reports
    loadUserData();
  }, []);

  // Filter reports when finalizedReports or statusFilter changes
  useEffect(() => {
    if (finalizedReports.length === 0) {
      setFilteredReports([]);
      return;
    }

    if (statusFilter === "all") {
      setFilteredReports(finalizedReports);
      return;
    }

    const filtered = finalizedReports.filter(report => report.status === statusFilter);
    setFilteredReports(filtered);
  }, [finalizedReports, statusFilter]);

  const loadUserData = () => {
    const userId = JSON.parse(localStorage.getItem("currentUser"))?.id;
    if (!userId) return;

    // Load student evaluations of companies
    const savedEvaluations =
      localStorage.getItem("studentCompanyEvaluations") || "[]";
    const parsedEvaluations = JSON.parse(savedEvaluations);

    // Load internship reports
    const savedReports = localStorage.getItem("internshipReports") || "[]";
    const parsedReports = JSON.parse(savedReports);

    // Create combined finalized reports (evaluations + reports by internship)
    const evaluationsByInternship = parsedEvaluations.filter(
      (evaluation) => evaluation.studentId === userId
    );
    const reportsByInternship = parsedReports.filter(
      (report) => report.studentId === userId
    );

    // Create map of internship IDs to combined reports
    const combinedReports = [];

    // First add all reports with their evaluations if they exist
    reportsByInternship.forEach((report) => {
      const matchingEval = evaluationsByInternship.find(
        (evaluation) => evaluation.internshipId === report.internshipId
      );

      combinedReports.push({
        id: report.internshipId,
        internshipId: report.internshipId,
        companyId: report.companyId,
        companyName: report.companyName,
        studentId: userId,
        reportId: report.id,
        reportTitle: report.title,
        reportIntroduction: report.introduction,
        reportBody: report.body,
        helpfulCourses: report.helpfulCourses || [],
        hasEvaluation: !!matchingEval,
        evaluationId: matchingEval?.id,
        evaluationText: matchingEval?.text || "",
        recommend: matchingEval?.recommend || false,
        date: report.date,
        isFinalized: !!matchingEval, // Consider finalized if it has both report and evaluation
        isSubmitted: report.isSubmitted || false,
        status: report.status || (report.isSubmitted ? "pending" : ""),
        statusComment: report.statusComment || "",
        reviewedBy: report.reviewedBy || null,
        reviewedByName: report.reviewedByName || "",
        reviewDate: report.reviewDate || null,
        hasAppeal: report.hasAppeal || false,
        appealText: report.appealText || "",
        appealDate: report.appealDate || null,
      });
    });

    // Now add evaluations that don't have reports
    evaluationsByInternship.forEach((evaluation) => {
      const exists = combinedReports.some(
        (report) => report.internshipId === evaluation.internshipId
      );
      if (!exists) {
        combinedReports.push({
          id: evaluation.internshipId,
          internshipId: evaluation.internshipId,
          companyId: evaluation.companyId,
          companyName: evaluation.companyName,
          studentId: userId,
          reportId: null,
          reportTitle: "",
          reportIntroduction: "",
          reportBody: "",
          helpfulCourses: [],
          hasEvaluation: true,
          evaluationId: evaluation.id,
          evaluationText: evaluation.text || "",
          recommend: evaluation.recommend || false,
          date: evaluation.date,
          isFinalized: false, // Not finalized because it has no report
          isSubmitted: false,
          status: "",
          statusComment: "",
        });
      }
    });

    setFinalizedReports(combinedReports);
    setFilteredReports(combinedReports);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handleSubmitReport = (item) => {
    setSelectedItem(item);
    setShowSubmitModal(true);
    setSubmissionMessage("");
  };

  const handleAppealReport = (item) => {
    setSelectedItem(item);
    setShowAppealModal(true);
    setAppealText("");
    setAppealMessage("");
  };

  const submitAppeal = () => {
    if (!selectedItem || !appealText.trim()) return;

    setIsSubmitting(true);

    // Simulate submission (in a real app, this would be an API call)
    setTimeout(() => {
      // Update the report with appeal information
      const savedReports = localStorage.getItem("internshipReports") || "[]";
      const reports = JSON.parse(savedReports);

      const reportIndex = reports.findIndex(
        (report) => report.id === selectedItem.reportId
      );

      if (reportIndex >= 0) {
        reports[reportIndex] = {
          ...reports[reportIndex],
          hasAppeal: true,
          appealText: appealText,
          appealDate: new Date().toISOString(),
        };

        localStorage.setItem("internshipReports", JSON.stringify(reports));

        // Update state
        setFinalizedReports((prev) =>
          prev.map((report) =>
            report.id === selectedItem.id
              ? {
                ...report,
                hasAppeal: true,
                appealText: appealText,
                appealDate: new Date().toISOString()
              }
              : report
          )
        );

        setIsSubmitting(false);
        setAppealMessage("Your appeal has been successfully submitted.");

        // Close modal after 2 seconds
        setTimeout(() => {
          setShowAppealModal(false);
          setAppealMessage("");
        }, 2000);
      }
    }, 1500);
  };

  const handleFinalSubmission = () => {
    if (!selectedItem) return;

    setIsSubmitting(true);

    // Simulate submission (in a real app, this would be an API call)
    setTimeout(() => {
      // Mark the report as submitted in localStorage
      const savedReports = localStorage.getItem("internshipReports") || "[]";
      const reports = JSON.parse(savedReports);

      const reportIndex = reports.findIndex(
        (report) => report.id === selectedItem.reportId
      );
      if (reportIndex >= 0) {
        reports[reportIndex] = {
          ...reports[reportIndex],
          isSubmitted: true,
          submissionDate: new Date().toISOString(),
          status: "pending", // Add pending status for newly submitted reports
        };
        localStorage.setItem("internshipReports", JSON.stringify(reports));
      }

      // Update state
      setFinalizedReports((prev) =>
        prev.map((report) =>
          report.id === selectedItem.id
            ? { ...report, isSubmitted: true, status: "pending" }
            : report
        )
      );

      setIsSubmitting(false);
      setSubmissionMessage("Your report has been successfully submitted.");

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowSubmitModal(false);
        setSubmissionMessage("");
      }, 2000);
    }, 1500);
  };

  const getCourseNames = (courseIds) => {
    if (!courseIds || !courseIds.length || !currentUser) return [];

    const userMajor = currentUser.major;
    const majorCourseList = coursesByMajor[userMajor] || [];

    return courseIds.map((id) => {
      const course = majorCourseList.find((c) => c.id === id);
      return course ? `${course.code}: ${course.name}` : "Unknown Course";
    });
  };

  const getStatusBadge = (status) => {
    if (!status) return null;

    switch (status) {
      case "pending":
        return <Badge bg="warning" text="dark">Pending Review</Badge>;
      case "accepted":
        return <Badge bg="success">Accepted</Badge>;
      case "rejected":
        return <Badge bg="danger">Rejected</Badge>;
      case "flagged":
        return <Badge bg="info">Flagged</Badge>;
      default:
        return null;
    }
  };

  // Direct submit without confirmation
  const handleDirectSubmit = (report) => {
    // Mark the report as submitted in localStorage
    const savedReports = localStorage.getItem("internshipReports") || "[]";
    const reports = JSON.parse(savedReports);

    const reportIndex = reports.findIndex(
      (savedReport) => savedReport.id === report.reportId
    );
    
    if (reportIndex >= 0) {
      reports[reportIndex] = {
        ...reports[reportIndex],
        isSubmitted: true,
        submissionDate: new Date().toISOString(),
        status: "pending", // Add pending status for newly submitted reports
      };
      localStorage.setItem("internshipReports", JSON.stringify(reports));
    }

    // Update state
    setFinalizedReports((prev) =>
      prev.map((item) =>
        item.id === report.id
          ? { ...item, isSubmitted: true, status: "pending" }
          : item
      )
    );

    // Show temporary alert
    const reportCard = document.getElementById(`report-card-${report.id}`);
    if (reportCard) {
      const alert = document.createElement('div');
      alert.className = 'alert alert-success mt-2';
      alert.innerHTML = 'Report submitted successfully!';
      reportCard.querySelector('.card-body').appendChild(alert);
      
      setTimeout(() => {
        if (alert.parentNode) {
          alert.parentNode.removeChild(alert);
        }
      }, 3000);
    }
  };

  const handleDownloadReport = (report) => {
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Set document properties
    doc.setProperties({
      title: `${report.reportTitle || report.companyName} - Internship Report`,
      author: currentUser?.name || 'Student',
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
    doc.text(`Name: ${currentUser?.name || 'N/A'}`, 20, 45);
    doc.text(`ID: ${currentUser?.gucId || currentUser?.id || 'N/A'}`, 20, 52);
    doc.text(`Major: ${currentUser?.major || 'N/A'}`, 20, 59);
    doc.text(`Email: ${currentUser?.email || 'N/A'}`, 20, 66);
    
    // Add company info
    doc.setFontSize(16);
    doc.setTextColor(70, 70, 70);
    doc.text(`Company: ${report.companyName}`, 20, 80, { align: 'left' });
    
    // Add horizontal line
    doc.setDrawColor(220, 220, 220);
    doc.line(20, 85, 190, 85);
    
    // Current position tracker
    let yPosition = 95;
    
    // Matching the order in the modal:
    
    // 1. Company Evaluation (if exists)
    if (report.hasEvaluation) {
      // Recommendation
      doc.setFontSize(12);
      doc.setTextColor(0, 102, 204);
      doc.text(`Recommend it to other interns: ${report.recommend ? 'YES' : 'NO'}`, 20, yPosition);
      yPosition += 10;
      
      // Evaluation Text
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 204);
      doc.text('My Evaluation to the comopany', 20, yPosition);
      yPosition += 7;
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      
      const evalLines = doc.splitTextToSize(report.evaluationText, 170);
      doc.text(evalLines, 20, yPosition);
      yPosition += (evalLines.length * 5) + 15;
    }
    
    // 2. Report Introduction (if exists)
    if (report.reportIntroduction) {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 204);
      doc.text('Introdcution', 20, yPosition);
      yPosition += 7;
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      
      const introLines = doc.splitTextToSize(report.reportIntroduction, 170);
      doc.text(introLines, 20, yPosition);
      yPosition += (introLines.length * 5) + 15;
    }
    
    // 3. Report Body
    if (report.reportBody) {
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
      
      const bodyLines = doc.splitTextToSize(report.reportBody, 170);
      doc.text(bodyLines, 20, yPosition);
      yPosition += (bodyLines.length * 5) + 15;
    }
    
    // 4. Helpful Courses (if exists)
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
      
      const courseNames = getCourseNames(report.helpfulCourses);
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
    
    // Save the PDF
    doc.save(`${currentUser?.name.replace(/\s+/g, '_')}_${report.companyName.replace(/\s+/g, '_')}_Report.pdf`);
  };

  return (
    <>
      <Container className="student-reports-container">
        <h2 className="page-title">Internship Reports</h2>
        <p className="page-description">
          View and submit your internship reports with company evaluations.
        </p>

        {/* Filter controls */}
        <div className="filter-container mb-4">
          <Row>
            <Col md={6} lg={4}>
              <Form.Group>
                <Form.Label>Filter by Status</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Reports</option>
                  <option value="pending">Pending Review</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="flagged">Flagged</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} lg={4} className="d-flex align-items-end">
              <Button
                variant="outline-secondary"
                className="mb-3"
                onClick={() => setStatusFilter("all")}
              >
                Clear Filter
              </Button>
            </Col>
          </Row>
        </div>

        <Row className="mt-4">
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <Col md={6} lg={4} key={report.id} className="mb-4">
                <Card
                  className={`finalized-report-card ${report.isFinalized ? "complete" : "incomplete"
                    } ${report.status === "rejected" ? "rejected" : ""} 
                    ${report.status === "flagged" ? "flagged" : ""}`}
                  id={`report-card-${report.id}`}
                >
                  <Card.Header>
                    <div>
                      <h5>{report.reportTitle || report.companyName}</h5>
                      <span className="company-name">{report.companyName}</span>
                    </div>
                    <div className="status-badges">
                    
                      {report.isSubmitted ? (
                        <>
                          <Badge bg="info" className="status-badge">
                            Submitted
                          </Badge>
                          {getStatusBadge(report.status)}
                        </>
                      ) : report.isFinalized ? (
                        <Badge bg="warning" className="status-badge">
                          Ready to Submit
                        </Badge>
                      ) : (
                        <Badge bg="secondary" className="status-badge">
                          Incomplete
                        </Badge>
                      )}

                      {report.hasAppeal && (
                        <Badge bg="primary" className="status-badge ms-1">
                          Appealed
                        </Badge>
                      )}
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <p className="report-date">
                      Last Updated: {formatDate(report.date)}
                    </p>

                    {report.status === "rejected" || report.status === "flagged" ? (
                      <Alert variant={report.status === "rejected" ? "danger" : "info"} className="mb-3">
                        <small>
                          {report.status === "rejected" ? "Rejected" : "Flagged"} on {formatDate(report.reviewDate)}
                          {report.statusComment && <div className="mt-1"><strong>Comment:</strong> {report.statusComment}</div>}
                        </small>
                      </Alert>
                    ) : null}

                    <div className="report-components">
                      <div className="component">
                        <span className="component-label">Report:</span>
                        <span
                          className={
                            report.reportBody ? "completed" : "missing"
                          }
                        >
                          {report.reportBody ? "Completed" : "Missing"}
                        </span>
                      </div>
                      <div className="component">
                        <span className="component-label">Evaluation:</span>
                        <span
                          className={
                            report.hasEvaluation ? "completed" : "missing"
                          }
                        >
                          {report.hasEvaluation ? "Completed" : "Missing"}
                        </span>
                      </div>
                    </div>

                    <div className="action-buttons">
                      <Button
                        variant="primary"
                        onClick={() => handleViewDetails(report)}
                      >
                        View Report
                      </Button>

                      {report.isFinalized && !report.isSubmitted && (
                        <>
                          <Button
                            variant="outline-success"
                            onClick={() => handleSubmitReport(report)}
                          >
                            Submit
                          </Button>
                        </>
                      )}

                      {report.isFinalized && (
                        <Button
                          variant="outline-secondary"
                          onClick={() => handleDownloadReport(report)}
                        >
                          Download PDF
                        </Button>
                      )}

                      {(report.status === "rejected" || report.status === "flagged") && !report.hasAppeal && (
                        <Button
                          variant="warning"
                          onClick={() => handleAppealReport(report)}
                        >
                          Appeal Decision
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col xs={12}>
              <div className="empty-state">
                <h4>No Reports Found</h4>
                {statusFilter !== "all" ? (
                  <p>
                    No reports with status "{statusFilter}" found. Try changing the filter or create new reports.
                  </p>
                ) : (
                  <p>
                    You haven't created any evaluations or reports yet. Complete
                    your internship and create reports (In Internships tab) to see
                    them here.
                  </p>
                )}
              </div>
            </Col>
          )}
        </Row>
      </Container>

      {/* Details Modal */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        size="lg"
        centered
        className="report-detail-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedItem?.reportTitle ||
              `Report for ${selectedItem?.companyName}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <div className="finalized-report-details">
              <div className="detail-header">
                <span className="detail-label">Company:</span>{" "}
                {selectedItem.companyName}
              </div>
              <div className="detail-header">
                <span className="detail-label">Last Updated:</span>{" "}
                {formatDate(selectedItem.date)}
              </div>

              {/* Show report status if submitted */}
              {selectedItem.isSubmitted && (
                <div className="detail-header">
                  <span className="detail-label">Status:</span>{" "}
                  {getStatusBadge(selectedItem.status)}

                  {/* Show review date if available */}
                  {selectedItem.reviewDate && (
                    <span className="ms-2 text-muted small">
                      (Reviewed on {formatDate(selectedItem.reviewDate)})
                    </span>
                  )}
                </div>
              )}

              {/* Show faculty feedback if rejected or flagged */}
              {(selectedItem.status === "rejected" || selectedItem.status === "flagged") && selectedItem.statusComment && (
                <div className="detail-content mt-3">
                  <h5>{selectedItem.status === "rejected" ? "Rejection" : "Flag"} Feedback:</h5>
                  <div className="content-box feedback-box">
                    {selectedItem.statusComment}
                    {selectedItem.reviewedByName && (
                      <div className="text-muted mt-2 small">
                        - {selectedItem.reviewedByName}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Show appeal if exists */}
              {selectedItem.hasAppeal && (
                <div className="detail-content mt-3">
                  <h5>Your Appeal:</h5>
                  <div className="content-box appeal-box">
                    {selectedItem.appealText}
                    <div className="text-muted mt-2 small">
                      Submitted on {formatDate(selectedItem.appealDate)}
                    </div>
                  </div>
                </div>
              )}

              {selectedItem.hasEvaluation && (
                <>
                  <div className="detail-header">
                    <span className="detail-label">Recommendation:</span>
                    {selectedItem.recommend ? (
                      <Badge bg="success" className="ms-2">
                        Recommended
                      </Badge>
                    ) : (
                      <Badge bg="secondary" className="ms-2">
                        Not Recommended
                      </Badge>
                    )}
                  </div>

                  <div className="detail-content mt-4">
                    <h5>Your Evaluation of the Company:</h5>
                    <div className="content-box">
                      {selectedItem.evaluationText}
                    </div>
                  </div>
                </>
              )}

              {selectedItem.reportBody && (
                <>
                  {selectedItem.reportIntroduction && (
                    <div className="detail-content mt-4">
                      <h5>Report Introduction:</h5>
                      <div className="content-box">
                        {selectedItem.reportIntroduction}
                      </div>
                    </div>
                  )}

                  <div className="detail-content mt-4">
                    <h5>Report Body:</h5>
                    <div className="content-box">{selectedItem.reportBody}</div>
                  </div>
                </>
              )}

              {selectedItem.helpfulCourses &&
                selectedItem.helpfulCourses.length > 0 && (
                  <div className="detail-content mt-4">
                    <h5>Helpful Courses:</h5>
                    <ul className="helpful-courses-list">
                      {getCourseNames(selectedItem.helpfulCourses).map(
                        (course, index) => (
                          <li key={index}>{course}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {!selectedItem.isFinalized && (
                <div className="incomplete-warning mt-4">
                  <p>
                    This report is incomplete. Please make sure you have both a
                    report and an evaluation to finalize it.
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          {/* Move the Appeal button to the left */}
          {selectedItem && (selectedItem.status === "rejected" || selectedItem.status === "flagged") && !selectedItem.hasAppeal && (
            <Button
              variant="warning"
              onClick={() => {
                setShowDetailsModal(false);
                handleAppealReport(selectedItem);
              }}
            >
              Appeal Decision
            </Button>
          )}
          
          {/* Show empty div as a spacer when appeal button isn't visible */}
          {(!selectedItem || 
           !(selectedItem.status === "rejected" || selectedItem.status === "flagged") || 
           selectedItem.hasAppeal) && <div></div>}
          
          {/* Move the Close button to the right */}
          <Button
            variant="secondary"
            onClick={() => setShowDetailsModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Submit Modal */}
      <Modal
        show={showSubmitModal}
        onHide={() => !isSubmitting && setShowSubmitModal(false)}
        centered
        className="submit-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Submit Final Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {submissionMessage ? (
            <div className="submission-success">
              <p className="text-success">{submissionMessage}</p>
            </div>
          ) : (
            <>
              <p>
                You are about to submit your finalized report for{" "}
                <strong>{selectedItem?.companyName}</strong>.
              </p>
              <p>
                Once submitted, it cannot be modified. Are you sure you want to
                proceed?
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {!submissionMessage && (
            <>
              <Button
                variant="secondary"
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleFinalSubmission}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* Appeal Modal */}
      <Modal
        show={showAppealModal}
        onHide={() => !isSubmitting && setShowAppealModal(false)}
        centered
        className="appeal-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Appeal Report Decision</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {appealMessage ? (
            <div className="submission-success">
              <p className="text-success">{appealMessage}</p>
            </div>
          ) : (
            <>
              <p>
                You are appealing the faculty's decision for your report on{" "}
                <strong>{selectedItem?.companyName}</strong>.
              </p>

              {selectedItem && (
                <Alert variant={selectedItem.status === "rejected" ? "danger" : "info"} className="mb-3">
                  <strong>Decision:</strong> {selectedItem.status === "rejected" ? "Rejected" : "Flagged"}
                  {selectedItem.statusComment && (
                    <div className="mt-1">
                      <strong>Comment:</strong> {selectedItem.statusComment}
                    </div>
                  )}
                </Alert>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Appeal Explanation</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={appealText}
                  onChange={(e) => setAppealText(e.target.value)}
                  placeholder="Explain why you believe this decision should be reconsidered. Provide specific details and address the feedback provided."
                />
                {appealText.trim() === "" && (
                  <Form.Text className="text-danger">
                    Please provide an explanation for your appeal.
                  </Form.Text>
                )}
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {!appealMessage && (
            <>
              <Button
                variant="secondary"
                onClick={() => setShowAppealModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={submitAppeal}
                disabled={isSubmitting || appealText.trim() === ""}
              >
                {isSubmitting ? "Submitting..." : "Submit Appeal"}
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default StudentReportsPage;
