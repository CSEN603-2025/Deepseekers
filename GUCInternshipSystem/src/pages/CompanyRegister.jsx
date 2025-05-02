import React, { useState } from 'react';
// import any custom components here if needed
// import Input from '../components/Input'; 
import '../css/CompnayRegister.css'; 


const CompanyRegister = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    companySize: '',
    email: '',
    logo: null,
  });

  const [logoPreview, setLogoPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'logo') {
      const file = files[0];
      setFormData({ ...formData, logo: file });
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.companyName ||
      !formData.industry ||
      !formData.companySize ||
      !formData.email ||
      !formData.logo
    ) {
      alert('Please fill in all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    console.log('Form Data:', formData);
    alert('Company registered successfully!');
  };

  return (
    <div className="company-register-container">
      <h2>Company Registration</h2>
      <form className="company-register-form" onSubmit={handleSubmit}>
        <label>
          Company Name:
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Industry:
          <input
            type="text"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Company Size:
          <select
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
          </select>
        </label>

        <label>
          Official Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Company Logo:
          <input
            type="file"
            name="logo"
            accept="image/*"
            onChange={handleChange}
            required
          />
        </label>

        {logoPreview && (
          <div className="logo-preview">
            <img src={logoPreview} alt="Logo Preview" />
          </div>
        )}

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default CompanyRegister;
