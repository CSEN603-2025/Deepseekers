import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Badge } from 'react-bootstrap';
import WorkshopCertificate from './WorkshopCertificate';
import '../css/myCertifications.css';

const MyCertifications = ({ studentId }) => {
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [studentName, setStudentName] = useState('');

  // Load certificates from localStorage when component mounts
  useEffect(() => {
    const storedCertificates = JSON.parse(localStorage.getItem(`certificates-${studentId}`)) || [];
    setCertificates(storedCertificates);
    
    // Get student name from currentUser
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
      setStudentName(currentUser.name);
    }
  }, [studentId]);

  const handleShowCertificate = (certificate) => {
    setSelectedCertificate({
      ...certificate,
      studentName: studentName
    });
    setShowCertificate(true);
  };

  const handleCloseCertificate = () => {
    setShowCertificate(false);
  };

  return (
    <div className="my-certifications">
      <h4 className="mb-4">My Workshop Certifications</h4>
      
      {certificates.length > 0 ? (
        <Row xs={1} md={2} lg={3} className="g-4">
          {certificates.map((certificate) => (
            <Col key={certificate.id}>
              <Card className="certification-card h-100">
                <Card.Body>
                  <div className="certificate-icon mb-3">
                    <i className="bi bi-award-fill"></i>
                  </div>
                  <Card.Title>{certificate.workshopTitle}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {certificate.instructorName}
                  </Card.Subtitle>
                  <div className="certificate-details">
                    <Badge bg="light" text="dark" className="certificate-date-badge">
                      <i className="bi bi-calendar me-1"></i>
                      {new Date(certificate.completionDate).toLocaleDateString()}
                    </Badge>
                    <Badge bg="light" text="dark" className="certificate-type-badge">
                      <i className="bi bi-tag me-1"></i>
                      {certificate.workshopType}
                    </Badge>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-white border-top-0">
                  <Button 
                    variant="link" 
                    className="p-0 text-decoration-none" 
                    onClick={() => handleShowCertificate(certificate)}
                  >
                    <i className="bi bi-eye me-1"></i>
                    Show more details
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center py-5 empty-certificates">
          <i className="bi bi-award display-4 text-secondary mb-3"></i>
          <h5>No Certifications Yet</h5>
          <p className="text-muted">
            Complete workshops to earn certificates that will appear here.
          </p>
        </div>
      )}
      
      {/* Certificate modal */}
      <WorkshopCertificate 
        isVisible={showCertificate}
        onClose={handleCloseCertificate}
        certificate={selectedCertificate}
      />
    </div>
  );
};

export default MyCertifications;