import React from 'react';
import { Modal, Button, Card } from 'react-bootstrap';
import '../css/workshopCertificate.css';

const WorkshopCertificate = ({ 
  isVisible, 
  onClose, 
  certificate 
}) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!certificate) return null;

  return (
    <Modal 
      show={isVisible} 
      onHide={onClose} 
      size="lg" 
      centered 
      className="certificate-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Workshop Certificate</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <div className="certificate-container">
          <div className="certificate">
            <div className="certificate-header">
              <h2 className="certificate-title">Certificate of Completion</h2>
              <div className="certificate-logo">
                <i className="bi bi-award-fill"></i>
              </div>
            </div>
            
            <div className="certificate-content">
              <p className="certificate-text">This is to certify that</p>
              <h3 className="student-name">{certificate.studentName}</h3>
              <p className="certificate-text">has successfully completed</p>
              <h4 className="workshop-name">"{certificate.workshopTitle}"</h4>
              <p className="certificate-description">
                This workshop provided valuable knowledge and skills in professional development.
              </p>
            </div>
            
            <div className="certificate-footer">
              <div className="certificate-date">
                <p>{formatDate(certificate.completionDate)}</p>
                <span>Date</span>
              </div>
              <div className="certificate-signature">
                <p>{certificate.instructorName}</p>
                <span>Instructor</span>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary">
          <i className="bi bi-download me-2"></i>
          Download Certificate
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WorkshopCertificate;