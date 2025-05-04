import React, { useEffect, useState } from "react";
import { Card, Button, Form, InputGroup, Row, Col, Badge } from "react-bootstrap";

import "../css/scadHome.css"; // Assuming you have a CSS file for styling

const ScadCompanyApplications = () => {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("registeredCompanies")) || [];
    setCompanies(stored);
  }, []);

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

  const industries = [...new Set(companies.map((c) => c.industry))];

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
          {industries.map((ind, i) => (
            <option key={i} value={ind}>{ind}</option>
          ))}
        </select>
      </div>
  
      {selectedCompany && (
        <div className="company-detail-card">
          <h4>{selectedCompany.companyName}</h4>
          <p><strong>Email:</strong> {selectedCompany.email}</p>
          <p><strong>Industry:</strong> {selectedCompany.industry}</p>
          <p><strong>Size:</strong> {selectedCompany.companySize}</p>
          <p><strong>Status:</strong> {selectedCompany.status}</p>
          <button onClick={() => setSelectedCompany(null)}>Close Details</button>
        </div>
      )}
  
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
                  <p><strong>Status:</strong> {company.status}</p>
                </div>
                <div className="company-actions">
                  <button onClick={() => setSelectedCompany(company)}>View</button>
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
            </li>
          ))
        )}
      </ul>
    </div>
  );

};

export default ScadCompanyApplications;
