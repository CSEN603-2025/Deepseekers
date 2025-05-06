import React, { useState, useRef } from 'react';
import { Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import '../css/ApplicationForm.css';

function ApplicationForm({ show, onHide, internship }) {
  const [formData, setFormData] = useState({
    coverLetter: '',
    whyApplying: '',
    relevantExperience: ''
  });

  const [files, setFiles] = useState({
    resume: null,
    certificate: null,
    otherDoc: null
  });

  const [fileNames, setFileNames] = useState({
    resume: '',
    certificate: '',
    otherDoc: ''
  });

  const [status, setStatus] = useState({
    isSubmitting: false,
    isSuccess: false,
    error: null
  });

  const fileInputRefs = {
    resume: useRef(),
    certificate: useRef(),
    otherDoc: useRef()
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    
    if (file) {
      // Check file type
      if (file.type !== 'application/pdf') {
        alert('Please upload only PDF files');
        e.target.value = '';
        return;
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit');
        e.target.value = '';
        return;
      }
      
      // Store file object for submission
      setFiles(prevFiles => ({
        ...prevFiles,
        [fileType]: file
      }));
      
      // Store file name for display
      setFileNames(prevNames => ({
        ...prevNames,
        [fileType]: file.name
      }));
      
      // Convert file to base64 for localStorage storage
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64File = reader.result;
        setFiles(prevFiles => ({
          ...prevFiles,
          [`${fileType}Base64`]: base64File
        }));
      };
    }
  };

  const clearFileInput = (fileType) => {
    fileInputRefs[fileType].current.value = '';
    setFiles(prevFiles => ({
      ...prevFiles,
      [fileType]: null,
      [`${fileType}Base64`]: null
    }));
    setFileNames(prevNames => ({
      ...prevNames,
      [fileType]: ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus({ ...status, isSubmitting: true, error: null });

    try {
      // Retrieve current user info
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      
      if (!currentUser) {
        setStatus({
          isSubmitting: false,
          isSuccess: false,
          error: 'You must be logged in to apply for internships.'
        });
        return;
      }

      // Create application object
      const application = {
        id: Date.now(),
        internshipId: internship.id,
        internshipTitle: internship.title,
        companyName: internship.companyName,
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentEmail: currentUser.email,
        applicationDate: new Date().toISOString(),
        status: 'pending',
        ...formData,
        ...files
      };

      // Add a new application to the student's history
      const appliedInternships = JSON.parse(localStorage.getItem('appliedInternships')) || [];
      appliedInternships.push(application);
      localStorage.setItem('appliedInternships', JSON.stringify(appliedInternships));

      // Update the internship's applications array and increment applicantsCount
      const internships = JSON.parse(localStorage.getItem('postedInternships')) || [];
      const updatedInternships = internships.map(item => {
        if (item.id === internship.id) {
          // Add to applications array
          const applications = item.applications || [];
          applications.push(application);
          
          // Update the internship
          return {
            ...item,
            applications,
            applicantsCount: (item.applicantsCount || 0) + 1
          };
        }
        return item;
      });
      
      // Save updated internships to localStorage
      localStorage.setItem('postedInternships', JSON.stringify(updatedInternships));

      // Show success status
      setStatus({
        isSubmitting: false,
        isSuccess: true,
        error: null
      });

      // Reset form after success
      setTimeout(() => {
        setFormData({
          coverLetter: '',
          whyApplying: '',
          relevantExperience: ''
        });
        setFiles({
          resume: null,
          certificate: null,
          otherDoc: null
        });
        setFileNames({
          resume: '',
          certificate: '',
          otherDoc: ''
        });
        onHide();
        setStatus(prev => ({ ...prev, isSuccess: false }));
      }, 2000);

    } catch (error) {
      console.error("Error submitting application:", error);
      setStatus({
        isSubmitting: false,
        isSuccess: false,
        error: "There was an error submitting your application. Please try again."
      });
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      backdrop="static"
      className="application-form-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Apply for Internship at {internship?.companyName}
          <div className="internship-title">
            Position: {internship?.title}
          </div>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {status.isSuccess && (
          <Alert variant="success">
            <Alert.Heading>Application Submitted Successfully!</Alert.Heading>
            <p>Your application has been submitted. You can check its status in your profile.</p>
          </Alert>
        )}

        {status.error && (
          <Alert variant="danger">
            <Alert.Heading>Error</Alert.Heading>
            <p>{status.error}</p>
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* Cover Letter */}
          <Form.Group className="mb-4">
            <Form.Label>Cover Letter</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Introduce yourself and explain why you're a good fit for the role"
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          {/* Why Applying */}
          <Form.Group className="mb-4">
            <Form.Label>Why are you interested in this position?</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Explain your interest in this specific position and company"
              name="whyApplying"
              value={formData.whyApplying}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          {/* Relevant Experience */}
          <Form.Group className="mb-4">
            <Form.Label>Relevant Experience & Skills</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Describe your relevant experience, projects, and skills"
              name="relevantExperience"
              value={formData.relevantExperience}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <hr className="my-4" />
          
          <h5 className="mb-3">Supporting Documents</h5>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group className="document-upload">
                <Form.Label>Resume/CV (Required) - PDF Only</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type="file"
                    ref={fileInputRefs.resume}
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, 'resume')}
                    required
                  />
                  {fileNames.resume && (
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => clearFileInput('resume')}
                      className="clear-file"
                    >
                      <i className="bi bi-x-circle"></i>
                    </Button>
                  )}
                </div>
                <Form.Text className="text-muted">
                  Only PDF format accepted. Max size: 5MB
                </Form.Text>
                {fileNames.resume && (
                  <div className="selected-file">Selected: {fileNames.resume}</div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Group className="document-upload">
                <Form.Label>Certificates (Optional) - PDF Only</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type="file"
                    ref={fileInputRefs.certificate}
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, 'certificate')}
                  />
                  {fileNames.certificate && (
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => clearFileInput('certificate')}
                      className="clear-file"
                    >
                      <i className="bi bi-x-circle"></i>
                    </Button>
                  )}
                </div>
                <Form.Text className="text-muted">
                  Accepted formats: PDF, JPG, PNG. Max size: 5MB
                </Form.Text>
                {fileNames.certificate && (
                  <div className="selected-file">Selected: {fileNames.certificate}</div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={12}>
              <Form.Group className="document-upload">
                  <Form.Label>Other Supporting Document (Optional) - PDF Only</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type="file"
                    ref={fileInputRefs.otherDoc}
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, 'otherDoc')}
                  />
                  {fileNames.otherDoc && (
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => clearFileInput('otherDoc')}
                      className="clear-file"
                    >
                      <i className="bi bi-x-circle"></i>
                    </Button>
                  )}
                </div>
                <Form.Text className="text-muted">
                  Only PDF format accepted. Max size: 5MB
                </Form.Text>
                {fileNames.otherDoc && (
                  <div className="selected-file">Selected: {fileNames.otherDoc}</div>
                )}
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={onHide}
          disabled={status.isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={status.isSubmitting || status.isSuccess}
        >
          {status.isSubmitting ? "Submitting..." : "Submit Application"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ApplicationForm;