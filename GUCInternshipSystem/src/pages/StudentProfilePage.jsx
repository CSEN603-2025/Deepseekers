import { useState } from 'react';
import '../css/StudentProfilePage.css';
import { useNavigate } from 'react-router-dom';



function StudentProfilePage() {
    const navigate = useNavigate();
    
    // Profile data state
    const [name, setName] = useState('Moez Amer');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [skills, setSkills] = useState('');
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    
    // Dummy data for applied internships
    const [appliedInternships] = useState([
        { id: 1, company: 'Google', position: 'Software Engineering Intern', status: 'Pending', appliedDate: '2025-04-15' },
        { id: 2, company: 'Meta', position: 'Frontend Developer Intern', status: 'Pending', appliedDate: '2025-04-10' },
        { id: 3, company: 'IBM', position: 'Data Science Intern', status: 'Finalized', appliedDate: '2025-03-28' },
        { id: 4, company: 'Amazon', position: 'Cloud Engineering Intern', status: 'Accepted', appliedDate: '2025-03-20' }
    ]);
    
    // UI state
    const [isEditing, setIsEditing] = useState(false);
    
    const handleBackgroundChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setBackgroundImage(imageUrl);
        }
    };
    
    const handleProfilePicChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
        }
    };
    
    // Helper function to get initials from name
    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };
    
    const toggleEditMode = () => {
        // Instead of toggling edit mode, navigate to EditStudentProfile page
        navigate('/student/edit-profile');
    };
    
    const handleSaveChanges = () => {
        // In a real app, you would save to a database here
        setIsEditing(false);
    };
    
    return(
        <div className="profile-container">
            <div className="profile-content">
                {/* Background Image Component */}
                <div className="profile_background_image">
                    <div className="background-gradient"></div>
                </div>
                
                {!isEditing ? (
                    // Profile View Mode
                    <div className="profile-info">
                        {/* Profile Picture Component */}
                        <div className="profile-picture-placeholder">
                            {profileImage ? (
                                <img src={profileImage} alt="Profile" className="profile-picture-image" />
                            ) : (
                                <span className="profile-picture-initials">
                                    {getInitials(name)}
                                </span>
                            )}
                        </div>
                        
                        <div className="profile-header">
                            <h1 className="profile-name">{name}</h1>
                            
                            <div className="profile-edit-buttons">
                                <label className="edit-button">
                                    Change Profile Picture
                                    <input 
                                        type="file" 
                                        className="file-input" 
                                        accept="image/*" 
                                        onChange={handleProfilePicChange} 
                                    />
                                </label>
                                
                                <label className="edit-button">
                                    Edit Background
                                    <input 
                                        type="file" 
                                        className="file-input" 
                                        accept="image/*" 
                                        onChange={handleBackgroundChange} 
                                    />
                                </label>
                                
                                <button onClick={toggleEditMode} className="edit-profile-button">
                                    Edit My Profile
                                </button>
                            </div>
                        </div>
                        
                        {bio && <p className="profile-bio">{bio}</p>}
                        {location && <p className="profile-location">{location}</p>}
                        {skills && <p className="profile-skills">{skills}</p>}
                        
                        {/* Applied Internships Section */}
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
                    </div>
                ) : (
                    // Profile Edit Mode
                    <div className="edit-profile-container">
                        <h1>Edit Profile</h1>
                        
                        <div className="form-group">
                            <label>Name</label>
                            <input 
                                type="text" 
                                placeholder="Enter your name" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Bio</label>
                            <textarea 
                                placeholder="Tell us about yourself" 
                                rows="4"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                            ></textarea>
                        </div>
                        
                        <div className="form-group">
                            <label>Location</label>
                            <input 
                                type="text" 
                                placeholder="City, Country" 
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Skills</label>
                            <input 
                                type="text" 
                                placeholder="Add skills separated by commas" 
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                            />
                        </div>
                        
                        <div className="form-actions">
                            <button onClick={toggleEditMode} className="edit-button">Cancel</button>
                            <button onClick={handleSaveChanges} className="edit-profile-button">Save Changes</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
export default StudentProfilePage;