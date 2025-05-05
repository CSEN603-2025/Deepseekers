import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

function LogoutButton({ className, style }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('companyName');
    // Clear any other items from localStorage if needed
    
    // Navigate to login page
    navigate('/');
  };

  // Default styles for consistent appearance
  const defaultStyles = {
    minWidth: '100px',
    fontWeight: '500',
    ...style
  };

  return (
    <Button 
      variant="outline-danger" 
      onClick={handleLogout} 
      className={className || 'logout-btn'}
      style={defaultStyles}
    >
      Logout
    </Button>
  );
}

export default LogoutButton;
