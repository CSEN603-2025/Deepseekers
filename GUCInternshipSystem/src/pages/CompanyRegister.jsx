import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Container, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/CompanyRegister.css';

const CompanyRegister = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    companySize: '',
    email: '',
    logo: null,
    taxDocument: null,
    // Add base64 fields to the initial state
    logoBase64: null,
    taxDocumentBase64: null
  });

  const [documentNames, setDocumentNames] = useState({
    taxDocument: '',
    businessLicense: ''
  });

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

  const [logoPreview, setLogoPreview] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setValidationError('');
    
    if (name === 'logo') {
      const file = files[0];
      if (file && file.size > 2 * 1024 * 1024) { // 2MB limit
        setValidationError('Logo file size must be under 2MB');
        return;
      }
      
      // Store file for form state
      setFormData({ ...formData, logo: file });
      setLogoPreview(URL.createObjectURL(file));
      
      // Convert logo to base64 for storage
      const reader = new FileReader();
      reader.onload = () => {
        const base64Logo = reader.result;
        setFormData(prev => ({ 
          ...prev, 
          logoBase64: base64Logo,
          logoName: file.name,
          logoType: file.type
        }));
      };
      reader.readAsDataURL(file);
    } 
    else if (name === 'taxDocument' || name === 'businessLicense') {
      const file = files[0];
      if (file) {
        // Check if it's a PDF file
        if (!file.type.includes('pdf')) {
          setValidationError(`${name === 'taxDocument' ? 'Tax document' : 'Business license'} must be a PDF file`);
          return;
        }
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setValidationError(`${name === 'taxDocument' ? 'Tax document' : 'Business license'} file size must be under 5MB`);
          return;
        }
        
        // Store file for form state
        setFormData({ ...formData, [name]: file });
        setDocumentNames({ ...documentNames, [name]: file.name });
        
        // Convert document to base64 for storage
        const reader = new FileReader();
        reader.onload = () => {
          const base64Doc = reader.result;
          if (name === 'taxDocument') {
            setFormData(prev => ({ 
              ...prev, 
              taxDocumentBase64: base64Doc,
              taxDocumentName: file.name,
              taxDocumentType: file.type 
            }));
          } else {
            setFormData(prev => ({ 
              ...prev, 
              businessLicenseBase64: base64Doc,
              businessLicenseName: file.name,
              businessLicenseType: file.type 
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    } 
    else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Debug information to help troubleshoot
    console.log("Form data at submission:", formData);

    if (
      !formData.companyName ||
      !formData.industry ||
      !formData.companySize ||
      !formData.email ||
      !formData.logo ||
      !formData.taxDocument
    ) {
      setValidationError('Please fill in all required fields and upload all required documents.');
      setIsSubmitting(false);
      return;
    }

    // If we have a logo file but no base64 yet, the FileReader hasn't finished
    if (formData.logo && !formData.logoBase64) {
      const logoReader = new FileReader();
      logoReader.onload = () => {
        setFormData(prev => ({
          ...prev,
          logoBase64: logoReader.result,
          logoName: formData.logo.name,
          logoType: formData.logo.type
        }));
      };
      logoReader.readAsDataURL(formData.logo);
    }

    // If we have a tax document file but no base64 yet, the FileReader hasn't finished
    if (formData.taxDocument && !formData.taxDocumentBase64) {
      const taxDocReader = new FileReader();
      taxDocReader.onload = () => {
        setFormData(prev => ({
          ...prev,
          taxDocumentBase64: taxDocReader.result,
          taxDocumentName: formData.taxDocument.name,
          taxDocumentType: formData.taxDocument.type
        }));
      };
      taxDocReader.readAsDataURL(formData.taxDocument);
      
      // Since we're still processing files, set a timeout to try again
      setTimeout(() => handleSubmit(e), 500);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setValidationError('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    // Now we can be sure all files are processed
    // Prepare the data for storage, removing File objects
    const companyData = {
      companyName: formData.companyName,
      industry: formData.industry,
      companySize: formData.companySize,
      email: formData.email,
      
      // Logo data
      logoBase64: formData.logoBase64,
      logoName: formData.logo.name,
      logoType: formData.logo.type,
      
      // Tax document data
      taxDocumentBase64: formData.taxDocumentBase64,
      taxDocumentName: formData.taxDocument.name,
      taxDocumentType: formData.taxDocument.type,
      
      // Business license data (optional)
      businessLicenseBase64: formData.businessLicenseBase64,
      businessLicenseName: formData.businessLicense ? formData.businessLicense.name : null,
      businessLicenseType: formData.businessLicense ? formData.businessLicense.type : null,
      
      status: "pending",
      submissionDate: new Date().toISOString()
    };

    const existingCompanies = JSON.parse(localStorage.getItem("registeredCompanies")) || [];
    existingCompanies.push(companyData);
    localStorage.setItem("registeredCompanies", JSON.stringify(existingCompanies));

    console.log('Company registered successfully!');
    alert('Company registered successfully! Your documents will be reviewed for verification.');
    navigate('/'); 
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <Card.Title className="login-title mb-3">Company Registration</Card.Title>

        {validationError && <Alert variant="danger">{validationError}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Company Name</Form.Label>
            <Form.Control
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Enter company name"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Industry</Form.Label>
            <Form.Select
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Industry --</option>
              {industriesList.map((industry, index) => (
                <option key={index} value={industry}>{industry}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Company Size</Form.Label>
            <Form.Select
              name="companySize"
              value={formData.companySize}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Size --</option>
              <option value="small">Small (≤ 50)</option>
              <option value="medium">Medium (51–100)</option>
              <option value="large">Large (101–500)</option>
              <option value="corporate">Corporate ({'>'} 500)</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Official Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter official email"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Company Logo</Form.Label>
            <Form.Control
              type="file"
              name="logo"
              accept="image/*"
              onChange={handleChange}
              required
            />
          </Form.Group>

          {logoPreview && (
            <div className="logo-preview mb-3 text-center">
              <img src={logoPreview} alt="Logo Preview" />
            </div>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>Tax Document (PDF only)</Form.Label>
            <Form.Control
              type="file"
              name="taxDocument"
              accept="application/pdf"
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Button className="btn-login w-100" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register'}
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default CompanyRegister;
