import { useState } from 'react';
import '../css/StudentProfilePage.css';
import { useNavigate } from 'react-router-dom';

function Profile({ user = { name: 'User Name' }, navigateTo = '/student/edit-profile', showEditButton = true, className = '' }) {
    const navigate = useNavigate();
    
    // Profile data state
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [skills, setSkills] = useState('');
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    
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
    
    const getInitials = (name) => {
        return name
            ?.split(' ')
            ?.map((n) => n[0])
            ?.join('')
            ?.toUpperCase() || '';
    };
    
    const toggleEditMode = () => {
        navigate(navigateTo);
    };
    
    return (
        <div className={`compact-profile-container ${className}`}>
            {/* Background Image */}
            <div 
                className="profile_background_image" 
                style={backgroundImage ? { 
                    backgroundImage: `url(${backgroundImage})`,
                    height: '150px'
                } : {}}
            >
                {!backgroundImage && <div className="background-gradient"></div>}
            </div>
            
            {/* Profile Info */}
            <div className="profile-info">
                {/* Profile Picture */}
                <div className="profile-picture-placeholder">
                    {profileImage ? (
                        <img src={profileImage} alt="Profile" className="profile-picture-image" />
                    ) : (
                        <span className="profile-picture-initials">
                            {getInitials(user.name)}
                        </span>
                    )}
                </div>
                
                <div className="profile-header">
                    <h1 className="profile-name">{user.name}</h1>
                    
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
        </div>
    );
}

export default Profile;