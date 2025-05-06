import React, { useState, useEffect } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import InternshipsAppliedFor from './InternshipsAppliedFor';
import '../css/StudentInternshipTabs.css';

function StudentInternshipTabs() {
  const [activeTab, setActiveTab] = useState('applied-internships');
  const [completedInternships, setCompletedInternships] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user data
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }

    // Load applications from localStorage and filter completed ones
    const loadCompletedInternships = () => {
      if (currentUser) {
        const allApplications = JSON.parse(localStorage.getItem('appliedInternships')) || [];
        // Filter applications for this student that are accepted
        const studentApplications = allApplications.filter(
          app => app.studentId === currentUser.id && 
                (app.status.toLowerCase() === 'accepted' || app.status.toLowerCase() === 'finalized')
        );
        setCompletedInternships(studentApplications);
      }
    };

    loadCompletedInternships();
  }, [currentUser]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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
        <Tab eventKey="completed-internships" title="Completed Internships">
          <div className="tab-content-container">
            <div className="completed-internships-container">
              {completedInternships.length > 0 ? (
                <div className="completed-internships-list">
                  {completedInternships.map(internship => (
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
                      </div>
                      <div className="completed-internship-actions">
                        <button className="view-certificate-btn">View Certificate</button>
                        <button className="view-details-btn">View Details</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-completed-internships">
                  <h5>No Completed Internships</h5>
                  <p>You haven't completed any internships yet. Once you complete an internship, it will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}

export default StudentInternshipTabs;