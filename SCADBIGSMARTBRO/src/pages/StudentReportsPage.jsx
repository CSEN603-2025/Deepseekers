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
} from "react-bootstrap";
import "../css/StudentReportsPage.css";
import { coursesByMajor } from "../Data/UserData";

function StudentReportsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [finalizedReports, setFinalizedReports] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");

  useEffect(() => {
    // Get current user
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }

    // Load evaluations and reports
    loadUserData();
  }, []);

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
        });
      }
    });

    setFinalizedReports(combinedReports);
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

  return (
    <>
      <Container className="student-reports-container">
        <h2 className="page-title">Finalized Internship Reports</h2>
        <p className="page-description">
          View and submit your complete internship reports with company
          evaluations.
        </p>

        <Row className="mt-4">
          {finalizedReports.length > 0 ? (
            finalizedReports.map((report) => (
              <Col md={6} lg={4} key={report.id} className="mb-4">
                <Card
                  className={`finalized-report-card ${
                    report.isFinalized ? "complete" : "incomplete"
                  }`}
                >
                  <Card.Header>
                    <div>
                      <h5>{report.reportTitle || report.companyName}</h5>
                      <span className="company-name">{report.companyName}</span>
                    </div>
                    <div className="status-badges">
                      {report.recommend && (
                        <Badge bg="success" className="recommend-badge">
                          Recommended
                        </Badge>
                      )}
                      {report.isSubmitted ? (
                        <Badge bg="info" className="status-badge">
                          Submitted
                        </Badge>
                      ) : report.isFinalized ? (
                        <Badge bg="warning" className="status-badge">
                          Ready to Submit
                        </Badge>
                      ) : (
                        <Badge bg="secondary" className="status-badge">
                          Incomplete
                        </Badge>
                      )}
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <p className="report-date">
                      Last Updated: {formatDate(report.date)}
                    </p>
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
                        <Button
                          variant="success"
                          onClick={() => handleSubmitReport(report)}
                        >
                          Submit Report
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
                <p>
                  You haven't created any evaluations or reports yet. Complete
                  your internship and create reports (In Internships tab) to see
                  them here.
                </p>
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
                    <h5>Company Evaluation:</h5>
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
        <Modal.Footer>
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
    </>
  );
}

export default StudentReportsPage;
