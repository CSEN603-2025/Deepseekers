// /pages/StudentHomePage.jsx
import React, { useState } from 'react';
import NavigationBar from '../components/NavigationBar';
import '../css/studentHome.css';

const StudentHomePage = () => {
  const [industryFilter, setIndustryFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [paidFilter, setPaidFilter] = useState('');

  // Dummy data
  const suggestedCompanies = ['Google', 'SAP', 'Meta'];
  const internships = [
    { company: 'SAP', title: 'ABAP Intern', duration: '3 months', industry: 'Software', paid: true },
    { company: 'Meta', title: 'Frontend Intern', duration: '2 months', industry: 'Tech', paid: false },
  ];

  const filteredInternships = internships.filter((intern) => {
    return (
      (industryFilter === '' || intern.industry === industryFilter) &&
      (durationFilter === '' || intern.duration === durationFilter) &&
      (paidFilter === '' || intern.paid === (paidFilter === 'paid'))
    );
  });

  return (    
      <div className="student-home">
        <h2>Suggested Companies</h2>
        <ul>
          {suggestedCompanies.map((company, i) => (
            <li key={i}>{company}</li>
          ))}
        </ul>

        <h2>Available Internships</h2>
        <div className="filters">
          <select onChange={(e) => setIndustryFilter(e.target.value)}>
            <option value="">All Industries</option>
            <option value="Software">Software</option>
            <option value="Tech">Tech</option>
          </select>
          <select onChange={(e) => setDurationFilter(e.target.value)}>
            <option value="">All Durations</option>
            <option value="2 months">2 months</option>
            <option value="3 months">3 months</option>
          </select>
          <select onChange={(e) => setPaidFilter(e.target.value)}>
            <option value="">Paid/Unpaid</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>

        <ul className="internship-list">
          {filteredInternships.map((i, idx) => (
            <li key={idx}>
              <strong>{i.company}</strong> - {i.title} ({i.duration}) [{i.paid ? 'Paid' : 'Unpaid'}]
            </li>
          ))}
        </ul>
      </div>
    
  );
};

export default StudentHomePage;
