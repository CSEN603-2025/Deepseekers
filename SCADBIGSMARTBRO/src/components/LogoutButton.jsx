import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    
    // Redirect to login page
    navigate('/login');
  };

  return (
    <Button 
      variant="outline-danger" 
      onClick={handleLogout}
      className="logout-button"
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
