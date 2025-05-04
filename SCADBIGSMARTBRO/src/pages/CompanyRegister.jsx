import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Container } from 'react-bootstrap';
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

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'logo') {
      const file = files[0];
      setFormData({ ...formData, logo: file });
      setLogoPreview(URL.createObjectURL(file));
    } else if (name === 'taxDocument') {
      const file = files[0];
      setFormData({ ...formData, taxDocument: file });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.companyName ||
      !formData.industry ||
      !formData.companySize ||
      !formData.email ||
      !formData.logo ||
      !formData.taxDocument
    ) {
      alert('Please fill in all fields and upload all required documents.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    const existingCompanies = JSON.parse(localStorage.getItem("registeredCompanies")) || [];
    existingCompanies.push({ ...formData, status: "pending" });
    localStorage.setItem("registeredCompanies", JSON.stringify(existingCompanies));

    console.log('Form Data:', formData);
    alert('Company registered successfully!');
    navigate('/'); 
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <Card.Title className="login-title mb-3">Company Registration</Card.Title>

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

          <Button className="btn-login w-100" type="submit">
            Register
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default CompanyRegister;
