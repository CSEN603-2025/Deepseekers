import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../css/navigationBar.css'; // Import the navigation bar CSS for consistent styling

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    
    // Redirect to login page
    navigate('/login');
  };

  // Check if we're in a navigation bar (dark background) or standalone (light background)
  const isInNavBar = window.location.pathname.includes('/faculty/') || 
                     window.location.pathname.includes('/scad/') ||
                     window.location.pathname === '/';
                     
  return (
    <Button 
      variant={isInNavBar ? "outline-light" : "primary"}
      className="logout-btn ms-3" 
      onClick={handleLogout}
      style={{
        borderRadius: '8px',
        padding: '0.4rem 1rem',
        fontSize: '0.9rem',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        backgroundColor: isInNavBar ? 'transparent' : '#00447c',
        color: 'white',
        border: isInNavBar ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid #00447c'
      }}
    >
      Log out
    </Button>
  );
};

export default LogoutButton;
