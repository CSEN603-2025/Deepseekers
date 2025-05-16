import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Modal, Button, Form } from 'react-bootstrap';
import InternshipsAppliedFor from './InternshipsAppliedFor';
import { coursesByMajor } from '../Data/UserData';
import '../css/StudentInternshipTabs.css';

function StudentInternshipTabs() {
  const [activeTab, setActiveTab] = useState('applied-internships');
  const [completedInternships, setCompletedInternships] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // First useEffect to load user data
  useEffect(() => {
    // Get current user data
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);
  
  // Second useEffect to load completed internships when currentUser changes
  useEffect(() => {
    if (currentUser) {
      const allApplications = JSON.parse(localStorage.getItem('appliedInternships')) || [];
      // Show all internships for this student with status 'internship complete' or 'current intern'
      const studentApplications = allApplications.filter(
        app => app.studentId === currentUser.id &&
          (app.status.toLowerCase() === 'internship_complete' || app.status.toLowerCase() === 'current_intern')
      );
      setCompletedInternships(studentApplications);
    }
  }, [currentUser]);
  // Modal states for evaluation and report
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState(null);
  
  // Evaluation states
  const [evaluationText, setEvaluationText] = useState('');
  const [recommendCompany, setRecommendCompany] = useState(false);
  
  // Report states
  const [reportTitle, setReportTitle] = useState('');
  const [reportIntro, setReportIntro] = useState('');
  const [reportBody, setReportBody] = useState('');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [majorCourses, setMajorCourses] = useState([]);

  // Filtering state for status and date
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Load evaluations and reports from local storage
  useEffect(() => {
    if (currentUser) {
      // Load courses for student's major
      const userMajor = currentUser.major || '';
      if (coursesByMajor[userMajor]) {
        setMajorCourses(coursesByMajor[userMajor]);
      }
    }
  }, [currentUser]);

  const filteredInternships = completedInternships.filter(internship => {
    let statusMatch = statusFilter === 'all' || internship.status.toLowerCase() === statusFilter;
    let dateMatch = true;
    if (dateFilter) {
      // Check if internship completionDate or applicationDate matches the filter (YYYY-MM-DD)
      const compDate = internship.completionDate ? internship.completionDate.slice(0, 10) : '';
      const appDate = internship.applicationDate ? internship.applicationDate.slice(0, 10) : '';
      dateMatch = compDate === dateFilter || appDate === dateFilter;
    }
    return statusMatch && dateMatch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  // Helper function to get student evaluations of companies from localStorage
  const getEvaluations = () => {
    const evaluations = localStorage.getItem('studentCompanyEvaluations');
    return evaluations ? JSON.parse(evaluations) : [];
  };

  // Helper function to get reports from localStorage
  const getReports = () => {
    const reports = localStorage.getItem('internshipReports');
    return reports ? JSON.parse(reports) : [];
  };
  
  // Helper function to get report status
  const getReportStatus = (internshipId) => {
    const reports = getReports();
    const report = reports.find(
      report => report.internshipId === internshipId && report.studentId === currentUser?.id
    );
    
    return report ? {
      status: report.status || 'pending',
      comment: report.statusComment || '',
      reviewedBy: report.reviewedByName || null,
      reviewDate: report.reviewDate || null
    } : null;
  };

  // Open evaluation modal
  const handleOpenEvaluation = (internship) => {
    setSelectedInternship(internship);
    
    // Check if an evaluation already exists
    const evaluations = getEvaluations();
    const existingEval = evaluations.find(
      item => item.internshipId === internship.id && item.studentId === currentUser.id
    );
    
    if (existingEval) {
      setEvaluationText(existingEval.text);
      setRecommendCompany(existingEval.recommend);
    } else {
      setEvaluationText('');
      setRecommendCompany(false);
    }
    
    setShowEvaluationModal(true);
  };
  // Save evaluation
  const handleSaveEvaluation = () => {
    if (!selectedInternship || !evaluationText.trim()) return;
    
    const evaluations = getEvaluations();
    
    // Check if evaluation exists
    const evalIndex = evaluations.findIndex(
      item => item.internshipId === selectedInternship.id && item.studentId === currentUser.id
    );
    
    const newEval = {
      id: evalIndex >= 0 ? evaluations[evalIndex].id : Date.now(),
      internshipId: selectedInternship.id,
      studentId: currentUser.id,
      companyId: selectedInternship.companyId,
      companyName: selectedInternship.companyName,
      text: evaluationText,
      recommend: recommendCompany,
      date: new Date().toISOString()
    };
    
    if (evalIndex >= 0) {
      evaluations[evalIndex] = newEval;
    } else {
      evaluations.push(newEval);
    }
    
    localStorage.setItem('studentCompanyEvaluations', JSON.stringify(evaluations));
    setShowEvaluationModal(false);
  };
  // Delete evaluation
  const handleDeleteEvaluation = () => {
    if (!selectedInternship) return;
    
    const evaluations = getEvaluations();
    const newEvaluations = evaluations.filter(
      item => !(item.internshipId === selectedInternship.id && item.studentId === currentUser.id)
    );
    
    localStorage.setItem('studentCompanyEvaluations', JSON.stringify(newEvaluations));
    setShowEvaluationModal(false);
  };

  // Open report modal
  const handleOpenReport = (internship) => {
    setSelectedInternship(internship);
    
    // Check if a report already exists
    const reports = getReports();
    const existingReport = reports.find(
      report => report.internshipId === internship.id && report.studentId === currentUser.id
    );
    
    if (existingReport) {
      setReportTitle(existingReport.title);
      setReportIntro(existingReport.introduction);
      setReportBody(existingReport.body);
      setSelectedCourses(existingReport.helpfulCourses || []);
    } else {
      setReportTitle('');
      setReportIntro('');
      setReportBody('');
      setSelectedCourses([]);
    }
    
    setShowReportModal(true);
  };

  // Save report
  const handleSaveReport = () => {
    if (!selectedInternship || !reportTitle.trim() || !reportIntro.trim() || !reportBody.trim()) return;
    
    const reports = getReports();
    
    // Check if report exists
    const reportIndex = reports.findIndex(
      report => report.internshipId === selectedInternship.id && report.studentId === currentUser.id
    );
    
    // Preserve existing status information if it exists
    const existingReport = reportIndex >= 0 ? reports[reportIndex] : {};
    
    const newReport = {
      id: reportIndex >= 0 ? reports[reportIndex].id : Date.now(),
      internshipId: selectedInternship.id,
      studentId: currentUser.id,
      companyId: selectedInternship.companyId,
      companyName: selectedInternship.companyName,
      title: reportTitle,
      introduction: reportIntro,
      body: reportBody,
      helpfulCourses: selectedCourses,
      date: new Date().toISOString(),
      isSubmitted: false, // Set to false initially
      // Preserve existing status information
      status: existingReport.status || 'pending',
      statusComment: existingReport.statusComment || '',
      reviewedBy: existingReport.reviewedBy || null,
      reviewedByName: existingReport.reviewedByName || null,
      reviewDate: existingReport.reviewDate || null
    };
    
    if (reportIndex >= 0) {
      reports[reportIndex] = newReport;
    } else {
      reports.push(newReport);
    }
    
    localStorage.setItem('internshipReports', JSON.stringify(reports));
    setShowReportModal(false);
  };

  // Delete report
  const handleDeleteReport = () => {
    if (!selectedInternship) return;
    
    const reports = getReports();
    const newReports = reports.filter(
      report => !(report.internshipId === selectedInternship.id && report.studentId === currentUser.id)
    );
    
    localStorage.setItem('internshipReports', JSON.stringify(newReports));
    setShowReportModal(false);
  };

  // Toggle course selection
  const handleCourseToggle = (courseId) => {
    if (selectedCourses.includes(courseId)) {
      setSelectedCourses(selectedCourses.filter(id => id !== courseId));
    } else {
      setSelectedCourses([...selectedCourses, courseId]);
    }
  };

  // Check if internship has evaluation/report
  const hasEvaluation = (internshipId) => {
    const evaluations = getEvaluations();
    return evaluations.some(item => item.internshipId === internshipId && item.studentId === currentUser?.id);
  };

  const hasReport = (internshipId) => {
    const reports = getReports();
    return reports.some(report => report.internshipId === internshipId && report.studentId === currentUser?.id);
  };
  
  return (
    <div className="student-internship-tabs-container">
      <Tabs
        activeKey={activeTab}
        onSelect={(key) => setActiveTab(key)}
        className="profile-tabs"
        fill
      >
        <Tab eventKey="applied-internships" title="Applied Internships">
          <div className="tab-content-container">
            <InternshipsAppliedFor />
          </div>
        </Tab>
        <Tab eventKey="completed-internships" title="My Internships">
          <div className="tab-content-container">
            <div className="completed-internships-container">
              {/* Filter controls */}
              <div className="internship-filters">
                <label>Status: </label>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">All</option>
                  <option value="internship_complete">Past Internships</option>
                  <option value="current_intern">Present Internships</option>
                </select>
                <label>Date: </label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                />
                <button onClick={() => setDateFilter('')}>Clear</button>
              </div>
              {filteredInternships.length > 0 ? (
                <div className="completed-internships-list">
                  {filteredInternships.map(internship => (
                    <div key={internship.id} className="completed-internship-card">
                      <div className="completed-internship-header">
                        <h5>{internship.internshipTitle}</h5>
                        <span className="completion-status">{internship.status}</span>
                      </div>
                      <div className="completed-internship-details">
                        <p className="company-name">{internship.companyName}</p>
                        <p className="application-date">Applied on: {formatDate(internship.applicationDate)}</p>
                        {internship.completionDate && (
                          <p className="completion-date">Completed on: {formatDate(internship.completionDate)}</p>
                        )}
                      </div>                      <div className="completed-internship-actions">
                        {internship.status.toLowerCase() === 'internship_complete' && (
                          <>
                            <div className="evaluation-actions">
                              <button 
                                className={`action-btn ${hasEvaluation(internship.id) ? 'edit' : 'add'}`}
                                onClick={() => handleOpenEvaluation(internship)}
                              >
                                {hasEvaluation(internship.id) ? 'Edit Evaluation' : 'Add Evaluation'}
                              </button>
                            </div>
                            
                            <div className="report-actions">
                              <button 
                                className={`action-btn ${hasReport(internship.id) ? 'edit' : 'add'}`}
                                onClick={() => handleOpenReport(internship)}
                              >
                                {hasReport(internship.id) ? 'Edit Report' : 'Add Report'}
                              </button>
                              
                              {hasReport(internship.id) && (
                                <div className="report-status-info">
                                  {(() => {
                                    const reportStatus = getReportStatus(internship.id);
                                    if (!reportStatus) return null;
                                    
                                    return (
                                      <>
                                        <div className="status-badge-container">
                                          <span className="status-label">Report Status:</span>
                                          {reportStatus.status === 'pending' && <span className="status-badge pending">Pending Review</span>}
                                          {reportStatus.status === 'accepted' && <span className="status-badge accepted">Accepted</span>}
                                          {reportStatus.status === 'rejected' && <span className="status-badge rejected">Rejected</span>}
                                          {reportStatus.status === 'flagged' && <span className="status-badge flagged">Flagged</span>}
                                        </div>
                                        {reportStatus.reviewDate && (
                                          <div className="review-info">
                                            <small>Reviewed on {formatDate(reportStatus.reviewDate)}</small>
                                            {reportStatus.reviewedBy && <small> by {reportStatus.reviewedBy}</small>}
                                          </div>
                                        )}
                                        {reportStatus.comment && (
                                          <div className="status-comment">
                                            <small><strong>Faculty Comment:</strong> {reportStatus.comment}</small>
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()} 
                                </div>
                              )}
                            </div>
                            {hasEvaluation(internship.id) && hasReport(internship.id) && (
                              <div className="finalization-message mt-3">
                                <p className="text-info">
                                  <i className="bi bi-info-circle me-2"></i>
                                  Go to the Reports tab to view a finalized version of your report and submit it.
                                </p>
                                <button 
                                  className="btn btn-primary mt-2"
                                  onClick={() => window.location.href = '/student/reports'}
                                >
                                  Go to Reports
                                </button>
                              </div>
                            )}
                          </>
                        )}
                        {internship.status.toLowerCase() !== 'internship_complete' && (
                          <p className="internship-status-message">
                            You can add evaluations and reports once this internship is completed.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-completed-internships">
                  <h5>No Completed or Current Internships</h5>
                  <p>You haven't completed or started any internships yet. Once you do, they will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </Tab>
      </Tabs>
      
      {/* Evaluation Modal */}
      <Modal show={showEvaluationModal} onHide={() => setShowEvaluationModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {hasEvaluation(selectedInternship?.id) ? 'Edit' : 'Add'} Company Evaluation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Your Evaluation</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={5} 
                value={evaluationText} 
                onChange={(e) => setEvaluationText(e.target.value)}
                placeholder="Share your experience with this company..."
              />
            </Form.Group>            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox" 
                id="recommend-company-checkbox"
                label="I recommend this company to other students" 
                checked={recommendCompany} 
                onChange={(e) => setRecommendCompany(e.target.checked)}
                className="recommend-checkbox" 
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {hasEvaluation(selectedInternship?.id) && (
            <Button variant="danger" onClick={handleDeleteEvaluation}>Delete Evaluation</Button>
          )}
          <Button variant="secondary" onClick={() => setShowEvaluationModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveEvaluation}>Save Evaluation</Button>
        </Modal.Footer>
      </Modal>
      
      {/* Report Modal */}
      <Modal show={showReportModal} onHide={() => setShowReportModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {hasReport(selectedInternship?.id) ? 'Edit' : 'Add'} Internship Report
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Report Title</Form.Label>
              <Form.Control 
                type="text" 
                value={reportTitle} 
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="Enter a title for your internship report"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Introduction</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                value={reportIntro} 
                onChange={(e) => setReportIntro(e.target.value)}
                placeholder="Briefly introduce your internship experience..."
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Report Body</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={6} 
                value={reportBody} 
                onChange={(e) => setReportBody(e.target.value)}
                placeholder="Detail your internship experience, skills gained, projects worked on..."
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Courses That Helped You During the Internship</Form.Label>
              <div className="courses-container">
                {majorCourses.map(course => (
                  <Form.Check 
                    key={course.id}
                    type="checkbox" 
                    id={`course-${course.id}`}
                    label={`${course.code}: ${course.name}`}
                    checked={selectedCourses.includes(course.id)}
                    onChange={() => handleCourseToggle(course.id)}
                    className="course-checkbox"
                  />
                ))}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {hasReport(selectedInternship?.id) && (
            <Button variant="danger" onClick={handleDeleteReport}>Delete Report</Button>
          )}
          <Button variant="secondary" onClick={() => setShowReportModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveReport}>Save Report</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default StudentInternshipTabs;
