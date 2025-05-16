import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import '../css/navigationBar.css'; // Import the navigation bar CSS for consistent styling

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('studentProfile');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userType');
    
    // Redirect to login page
    navigate('/login');
  };

  return (
    <Button 
      variant="outline-light" 
      className="logout-btn ms-3" 
      onClick={handleLogout}
    >
      Log out
    </Button>
  );
};

export default LogoutButton;
