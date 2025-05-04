import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

function LogoutButton({ className }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any stored user data/tokens if needed
    localStorage.removeItem('companyName');
    // Add any other items to clear from localStorage
    
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
