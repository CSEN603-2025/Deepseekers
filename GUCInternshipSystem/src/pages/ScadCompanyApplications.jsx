import React, { useEffect, useState } from "react";
import { Card, Button, Form, InputGroup, Row, Col, Badge } from "react-bootstrap";

import "../css/scadHome.css"; // Assuming you have a CSS file for styling

const ScadCompanyApplications = () => {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

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
  };

  const handleStatusChange = (index, newStatus) => {
    const updated = [...companies];
    updated[index].status = newStatus;
    setCompanies(updated);
    localStorage.setItem("registeredCompanies", JSON.stringify(updated));
  };

  const filteredCompanies = companies.filter((company) => {
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
    </div>
  );
};

export default ScadCompanyApplications;
