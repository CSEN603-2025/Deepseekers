import { useState } from 'react';
import '../css/StudentProfilePage.css';
import { useNavigate } from 'react-router-dom';

function Profile({ name = 'User Name', navigateTo = '/student/edit-profile', showEditButton = true }) {
    const navigate = useNavigate();
    
    // Profile data state
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [skills, setSkills] = useState('');
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    
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
        // Navigate to edit profile page
        navigate(navigateTo);
    };
    
    const handleSaveChanges = () => {
        // In a real app, you would save to a database here
        setIsEditing(false);
    };
    
    return (
        <div className="profile-container">
            <div className="profile-content">
                {/* Background Image Component */}
                <div className="profile_background_image" style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                    {!backgroundImage && <div className="background-gradient"></div>}
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
                                
                                {showEditButton && (
                                    <button onClick={toggleEditMode} className="edit-profile-button">
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        {bio && <p className="profile-bio">{bio}</p>}
                        {location && <p className="profile-location">{location}</p>}
                        {skills && <p className="profile-skills">{skills}</p>}
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
                                readOnly 
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

export default Profile;
