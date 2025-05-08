import React, { useEffect, useState } from "react";
import { Card, Button, Form, InputGroup, Row, Col, Badge, Modal } from "react-bootstrap";

import "../css/scadHome.css"; // Assuming you have a CSS file for styling

const ScadCompanyApplications = () => {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [companiesToShow, setCompaniesToShow] = useState([]);

  // Using the same industry list from CompanyRegister.jsx
  const industriesList = [
    'Technology',
    'Finance',
    'Healthcare',
    'Education',
    'Manufacturing',
    'Retail',
    'Telecommunications',
    'Media',
    'Automotive',
    'Construction',
    'Energy',
    'Agriculture',
    'Hospitality',
    'Consulting',
    'Other'
  ];

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = () => {
    const stored = JSON.parse(localStorage.getItem("registeredCompanies")) || [];
    setCompanies(stored);
    // Initially show all pending companies
    setCompaniesToShow(stored.filter(company => company.status === "pending"));
  };

  const handleStatusChange = (index, newStatus) => {
    // Get the company from the filtered display list
    const companyToUpdate = companiesToShow[index];
    
    // Find this company in the original array by a unique identifier (using ID or name+email as unique key)
    const originalCompanies = JSON.parse(localStorage.getItem("registeredCompanies")) || [];
    const updatedCompanies = originalCompanies.map(company => {
      // Using company name and email as a composite unique identifier
      if (company.email === companyToUpdate.email && company.companyName === companyToUpdate.companyName) {
        return { ...company, status: newStatus };
      }
      return company;
    });
    
    // Update localStorage with the updated companies
    localStorage.setItem("registeredCompanies", JSON.stringify(updatedCompanies));
    
    // Update the React state
    setCompanies(updatedCompanies);
    
    // Show appropriate modal message
    if (newStatus === "accepted") {
      setModalTitle("Company Accepted");
      setModalMessage(`An email will be sent to ${companyToUpdate.companyName} at ${companyToUpdate.email} informing them of their acceptance.`);
    } else if (newStatus === "rejected") {
      setModalTitle("Company Rejected");
      setModalMessage(`An email will be sent to ${companyToUpdate.companyName} at ${companyToUpdate.email} informing them of their rejection.`);
    }
    setShowModal(true);
    
    // Remove the company from the displayed list
    const updatedToShow = companiesToShow.filter((_, i) => i !== index);
    setCompaniesToShow(updatedToShow);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Update the filtered companies to use the companiesToShow state
  const filteredCompanies = companiesToShow.filter((company) => {
    const matchesName = company.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = industryFilter === "" || company.industry === industryFilter;
    return matchesName && matchesIndustry;
  });

  const toggleCompanyDetails = (index) => {
    setSelectedCompanyId(selectedCompanyId === index ? null : index);
  };

  // Function to open PDF in new window for viewing
  const viewDocument = (documentBase64, documentName) => {
    if (documentBase64) {
      const newWindow = window.open();
      newWindow.document.write(`
        <html>
          <head>
            <title>${documentName || 'Document'}</title>
            <style>
              body, html { margin: 0; padding: 0; height: 100%; }
              embed { width: 100%; height: 100%; }
            </style>
          </head>
          <body>
            <embed src="${documentBase64}" type="application/pdf" width="100%" height="100%" />
          </body>
        </html>
      `);
    } else {
      alert("Document not available for viewing");
    }
  };

  return (
    <div className="scad-home">
      <h2>Registered Companies</h2>
  
      <div className="filters">
        <input
          type="text"
          placeholder="Search by company name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)}>
          <option value="">All Industries</option>
          {industriesList.map((industry, i) => (
            <option key={i} value={industry}>{industry}</option>
          ))}
        </select>
      </div>
  
      <ul className="company-list">
        {filteredCompanies.length === 0 ? (
          <li>No companies found.</li>
        ) : (
          filteredCompanies.map((company, index) => (
            <li key={index}>
              <div className="company-card">
                <div className="company-info">
                  <h5>{company.companyName}</h5>
                  <p><strong>Industry:</strong> {company.industry}</p>
                  <p><strong>Status:</strong> <span className={`status-badge status-${company.status}`}>{company.status}</span></p>
                </div>
                <div className="company-actions">
                  <button onClick={() => toggleCompanyDetails(index)}>
                    {selectedCompanyId === index ? "Hide Details" : "View Details"}
                  </button>
                  <button
                    className="accept-btn"
                    onClick={() => handleStatusChange(index, "accepted")}
                    disabled={company.status === "accepted"}
                  >
                    Accept
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleStatusChange(index, "rejected")}
                    disabled={company.status === "rejected"}
                  >
                    Reject
                  </button>
                </div>
              </div>
              
              {selectedCompanyId === index && (
                <div className="company-detail-card">
                  <h4>Company Details</h4>
                  
                  <div className="detail-content">
                    <div className="company-details-info">
                      <p><strong>Company Name:</strong> {company.companyName}</p>
                      <p><strong>Email:</strong> {company.email}</p>
                      <p><strong>Industry:</strong> {company.industry}</p>
                      <p><strong>Size:</strong> {company.companySize}</p>
                      <p><strong>Status:</strong> <span className={`status-badge status-${company.status}`}>{company.status}</span></p>
                      {company.submissionDate && (
                        <p><strong>Submission Date:</strong> {new Date(company.submissionDate).toLocaleDateString()}</p>
                      )}
                    </div>
                    
                    <div className="company-logo-container">
                      <h5>Company Logo</h5>
                      {company.logoBase64 ? (
                        <div className="company-logo">
                          <img 
                            src={company.logoBase64} 
                            alt={`${company.companyName} logo`}
                          />
                        </div>
                      ) : (
                        <div className="no-logo">No logo provided</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="document-section">
                    <h5>Verification Documents</h5>
                    <div className="document-container">
                      <div className="document-item">
                        <span className="document-label">Tax Document:</span>
                        {company.taxDocumentBase64 ? (
                          <div className="document-actions">
                            <span className="document-name">{company.taxDocumentName || "tax_document.pdf"}</span>
                            <button 
                              className="view-document-btn" 
                              onClick={() => viewDocument(company.taxDocumentBase64, company.taxDocumentName)}
                            >
                              View Document
                            </button>
                          </div>
                        ) : (
                          <span className="no-document">No document provided</span>
                        )}
                      </div>
                      
                      {company.businessLicenseBase64 && (
                        <div className="document-item">
                          <span className="document-label">Business License:</span>
                          <div className="document-actions">
                            <span className="document-name">{company.businessLicenseName || "business_license.pdf"}</span>
                            <button 
                              className="view-document-btn"
                              onClick={() => viewDocument(company.businessLicenseBase64, company.businessLicenseName)}
                            >
                              View Document
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))
        )}
      </ul>

      {/* Modal for showing messages */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalMessage}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ScadCompanyApplications;
