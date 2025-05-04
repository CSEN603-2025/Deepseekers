import { useState } from 'react';
import '../css/StudentProfilePage.css';

function InternshipsAppliedFor() {
    // Dummy data for applied internships
    const [appliedInternships] = useState([
        { id: 1, company: 'Google', position: 'Software Engineering Intern', status: 'Pending', appliedDate: '2025-04-15' },
        { id: 2, company: 'Meta', position: 'Frontend Developer Intern', status: 'Pending', appliedDate: '2025-04-10' },
        { id: 3, company: 'IBM', position: 'Data Science Intern', status: 'Finalized', appliedDate: '2025-03-28' },
        { id: 4, company: 'Amazon', position: 'Cloud Engineering Intern', status: 'Accepted', appliedDate: '2025-03-20' }
    ]);
    
    return (
        <div className="applied-internships-section">
            <h2>Applied Internships</h2>
            <div className="internships-list">
                {appliedInternships.map((internship) => (
                    <div key={internship.id} className="internship-card">
                        <div className="internship-header">
                            <h3>{internship.position}</h3>
                            <span className={`status-badge status-${internship.status.toLowerCase()}`}>
                                {internship.status}
                            </span>
                        </div>
                        <div className="internship-details">
                            <p className="company-name">{internship.company}</p>
                            <p className="applied-date">Applied: {internship.appliedDate}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default InternshipsAppliedFor;
