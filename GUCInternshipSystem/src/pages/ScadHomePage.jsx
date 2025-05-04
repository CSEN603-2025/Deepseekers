import React from 'react';
import LogoutButton from '../components/LogoutButton';


export default function ScadHomePage() {
    return (
        <div className="scad-home-page">
            <div className="logout-container" style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}>
                <LogoutButton />
            </div>
            <p>YET NOT IMPLEMENTED</p>
        </div>
    );
}



