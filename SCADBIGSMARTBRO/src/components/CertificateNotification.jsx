import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const CertificateNotification = ({ 
  show, 
  onClose,
  workshopTitle
}) => {
  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1070 }}>
      <Toast show={show} onClose={onClose} delay={5000} autohide>
        <Toast.Header>
          <i className="bi bi-award-fill me-2 text-primary"></i>
          <strong className="me-auto">Certificate Earned</strong>
          <small>Just now</small>
        </Toast.Header>
        <Toast.Body>
          <p className="mb-0">
            Congratulations! You've earned a certificate for completing:
          </p>
          <p className="fw-bold mb-0">{workshopTitle}</p>
          <p className="mt-2 mb-0"><small>View it in "My Certifications"</small></p>
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default CertificateNotification;