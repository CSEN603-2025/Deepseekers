import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

function LogoutButton({ className }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Get the current user data before clearing
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // We want to preserve studentProfile data but remove session data
    // We don't need to do anything with studentProfile here
    // as our login handler now properly handles existing profile data
    
    // Remove session data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('companyName');
    // Add any other session items to clear from localStorage
    
    // Navigate to login page
    navigate('/');
  };

  return (
    <Button 
      variant="outline-danger" 
      onClick={handleLogout} 
      className={className || 'logout-btn'}
    >
      Logout
    </Button>
  );
}

export default LogoutButton;
