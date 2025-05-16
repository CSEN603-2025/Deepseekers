import React, { useEffect, useState } from "react";
import { Card, Button, Form, InputGroup, Row, Col, Badge, Modal, Container, Table } from "react-bootstrap";
import { FaSearch, FaFilter, FaCheckCircle, FaTimesCircle, FaEye } from "react-icons/fa";

import "../css/scadHome.css";
import "../css/FacultyReportsPage.css"; // Import the same styling used in Faculty pages

const ScadCompanyApplications = () => {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [companiesToShow, setCompaniesToShow] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

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

  const handleViewCompanyDetails = (company) => {
    setSelectedCompany(company);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
  };

  return (
    <div className="scad-home">
      <h2 className="page-title">Registered Companies</h2>
      
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by company name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text><FaFilter /></InputGroup.Text>
                <Form.Select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                >
                  <option value="">All Industries</option>
                  {industriesList.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
  
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No companies found.</p>
            </div>
          ) : (
            <Table responsive hover className="align-middle">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Industry</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company, index) => (
                  <tr key={index}>
                    <td>{company.companyName}</td>
                    <td>{company.industry}</td>
                    <td>{company.companySize}</td>
                    <td>
                      <Badge className={`badge-${company.status === 'pending' ? 'pending' : company.status === 'accepted' ? 'accepted' : 'rejected'}`}>
                        {company.status || 'Pending'}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        <Button 
                          className="btn-primary me-1"
                          onClick={() => handleViewCompanyDetails(company)}
                        >
                          <FaEye className="me-1" /> View Details
                        </Button>
                        {company.status === 'pending' && (
                          <>
                            <Button 
                              className="btn-success me-1"
                              onClick={() => handleStatusChange(index, "accepted")}
                            >
                              <FaCheckCircle className="me-1" /> Accept
                            </Button>
                            <Button 
                              className="btn-danger"
                              onClick={() => handleStatusChange(index, "rejected")}
                            >
                              <FaTimesCircle className="me-1" /> Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Company Details Modal */}
      <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Company Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCompany && (
            <>
              <Row>
                <Col md={8}>
                  <h5 className="mb-3">Company Information</h5>
                  <Table borderless size="sm">
                    <tbody>
                      <tr>
                        <td width="30%"><strong>Company Name:</strong></td>
                        <td>{selectedCompany.companyName}</td>
                      </tr>
                      <tr>
                        <td><strong>Email:</strong></td>
                        <td>{selectedCompany.email}</td>
                      </tr>
                      <tr>
                        <td><strong>Industry:</strong></td>
                        <td>{selectedCompany.industry}</td>
                      </tr>
                      <tr>
                        <td><strong>Size:</strong></td>
                        <td>{selectedCompany.companySize}</td>
                      </tr>
                      <tr>
                        <td><strong>Status:</strong></td>
                        <td>
                          <Badge className={`badge-${selectedCompany.status === 'pending' ? 'pending' : selectedCompany.status === 'accepted' ? 'accepted' : 'rejected'}`}>
                            {selectedCompany.status || 'Pending'}
                          </Badge>
                        </td>
                      </tr>
                      {selectedCompany.submissionDate && (
                        <tr>
                          <td><strong>Submission Date:</strong></td>
                          <td>{new Date(selectedCompany.submissionDate).toLocaleDateString()}</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Col>
                <Col md={4}>
                  <h5 className="mb-3">Company Logo</h5>
                  {selectedCompany.logoBase64 ? (
                    <div className="text-center p-3 border rounded">
                      <img 
                        src={selectedCompany.logoBase64} 
                        alt={`${selectedCompany.companyName} logo`}
                        style={{ maxWidth: '100%', maxHeight: '150px' }}
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-light text-center text-muted border rounded">
                      No logo provided
                    </div>
                  )}
                </Col>
              </Row>
              
              <hr className="my-4" />
              
              <h5 className="mb-3">Verification Documents</h5>
              <Card>
                <Card.Body>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong>Tax Document:</strong>
                      {selectedCompany.taxDocumentBase64 ? (
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => viewDocument(selectedCompany.taxDocumentBase64, selectedCompany.taxDocumentName)}
                        >
                          View Document
                        </Button>
                      ) : (
                        <span className="text-danger">Not provided</span>
                      )}
                    </div>
                    {selectedCompany.taxDocumentBase64 && (
                      <small className="text-muted">{selectedCompany.taxDocumentName || "tax_document.pdf"}</small>
                    )}
                  </div>
                  
                  {selectedCompany.businessLicenseBase64 && (
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>Business License:</strong>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => viewDocument(selectedCompany.businessLicenseBase64, selectedCompany.businessLicenseName)}
                        >
                          View Document
                        </Button>
                      </div>
                      <small className="text-muted">{selectedCompany.businessLicenseName || "business_license.pdf"}</small>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetailsModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Status Change Modal */}
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
