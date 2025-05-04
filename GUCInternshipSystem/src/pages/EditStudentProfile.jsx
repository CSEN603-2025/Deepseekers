// /pages/StudentProfile.jsx
import React, { useState, useEffect } from 'react';
import '../css/EditStudentProfile.css';



const majors = [
  { name: 'MET', semesters: 10 },
  { name: 'DMET', semesters: 10 },
  { name: 'IET', semesters: 10 },
  { name: 'Mechatronics', semesters: 10 },
  { name: 'BI', semesters: 8 },
  { name: 'Pharmacy', semesters: 10 },
  { name: 'Management', semesters: 8 },
  { name: 'Business', semesters: 8 },
  {name: 'Law', semesters: 8}
];

const EditStudentProfile = () => {
  const [profile, setProfile] = useState({
    jobInterests: '',
    internships: '',
    activities: '',
    major: '',
    semester: '',
  });

  // Load from localStorage when component mounts
useEffect(() => {
  const savedProfile = localStorage.getItem('studentProfile');
  if (savedProfile) {
    setProfile(JSON.parse(savedProfile));
    // Also generate semester options if major exists
    const majorObj = majors.find((m) => m.name === JSON.parse(savedProfile).major);
    if (majorObj) {
      const semesters = [...Array(majorObj.semesters)].map((_, i) => i + 1);
      setSemesterOptions(semesters);
    }
  }
}, []);
    
  const [semesterOptions, setSemesterOptions] = useState([]);

  const handleMajorChange = (e) => {
    const selectedMajor = e.target.value;
    setProfile({ ...profile, major: selectedMajor });

    // Find the selected major object
    const majorObj = majors.find((major) => major.name === selectedMajor);
    if (majorObj) {
      // Adjust the semester options based on the major
      const maxSemesters = majorObj.semesters;
      const semesters = [...Array(maxSemesters)].map((_, i) => i + 1);
      setSemesterOptions(semesters);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('studentProfile', JSON.stringify(profile));
    alert("Profile saved successfully!");
  };

  const handleClear = () => {
    const confirmed = window.confirm("Are you sure you want to clear your profile?");
    if (confirmed) {
      localStorage.removeItem('studentProfile');
      setProfile({
        jobInterests: '',
        internships: '',
        activities: '',
        major: '',
        semester: '',
      });
      setSemesterOptions([]);
    }
  };
  
  return (
 
      <div className="student-profile-container">
        <h2>Your Profile</h2>
        <p>Edit your job interests, past experiences, and academic details.</p>
        <form className="profile-form" onSubmit={handleSubmit}>
          <label>
            Job Interests:
            <textarea
              name="jobInterests"
              value={profile.jobInterests}
              onChange={handleChange}
              placeholder="e.g. Frontend development, AI, networking..."
            />
          </label>

          <label>
            Previous Internships / Part-time Jobs:
            <textarea
              name="internships"
              value={profile.internships}
              onChange={handleChange}
              placeholder="Include responsibilities, duration, company name..."
            />
          </label>

          <label>
            College Activities:
            <textarea
              name="activities"
              value={profile.activities}
              onChange={handleChange}
              placeholder="e.g. Member of robotics club, volunteered at events..."
            />
          </label>

          <label>
            Major:
            <select name="major" value={profile.major} onChange={handleMajorChange}>
              <option value="">Select Major</option>
              {majors
                .sort((a, b) => a.name.localeCompare(b.name)) // Alphabetically sort majors
                .map((major) => (
                  <option key={major.name} value={major.name}>
                    {major.name}
                  </option>
                ))}
            </select>
          </label>

          {profile.major && (
            <label>
              Semester Number:
              <select name="semester" value={profile.semester} onChange={handleChange}>
                <option value="">Select Semester</option>
                {semesterOptions.map((semester) => (
                  <option key={semester} value={semester}>
                    {semester}
                  </option>
                ))}
              </select>
            </label>
          )}
          
          <div className="button-row">
  <button type="submit">Save Profile</button>
  <div className="right-button">
    <button type="button" onClick={handleClear}>Clear Profile</button>
  </div>
</div>
        </form>
      </div>
  );
};

export default EditStudentProfile;
