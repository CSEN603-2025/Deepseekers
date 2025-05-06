import React from 'react';
import { Container } from 'react-bootstrap';
import StudentInternshipTabs from '../components/StudentInternshipTabs';
import '../css/StudentInternshipTabs.css';

const StudentInternshipsPage = () => {
  return (
    <Container className="student-internships-page py-4">
      <h2 className="mb-4">My Internships</h2><br></br>
      <StudentInternshipTabs />
    </Container>
  );
};

export default StudentInternshipsPage;