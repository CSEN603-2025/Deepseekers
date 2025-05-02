// /pages/StudentProfile.jsx
import React, { useState } from 'react';
import NavigationBar from '../components/NavigationBar';
import '../css/studentProfile.css'; // Assuming you have a CSS file for styling

const majors = [
  { name: 'MET', semesters: 10 },
  { name: 'DMET', semesters: 10 },
  { name: 'IET', semesters: 10 },
  { name: 'Mechatronics', semesters: 10 },
  { name: 'BI', semesters: 8 },
  { name: 'Pharmacy', semesters: 10 },
  { name: 'Management', semesters: 8 },
  { name: 'Business', semesters: 8 },
];

const StudentProfile = () => {
  const [profile, setProfile] = useState({
    jobInterests: '',
    internships: '',
    activities: '',
    major: '',
    semester: '',
  });

    
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
    console.log('Profile submitted:', profile);
    alert("Profile saved successfully!");
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
          
          <button type="submit">Save Profile</button>
        </form>
      </div>
  );
};

export default StudentProfile;
