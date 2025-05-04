import React, { useState, useEffect } from "react";
import { Container, Button, Card, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Profile from "../components/Profile";
import PostInternship from "../components/PostInternship";
import LogoutButton from "../components/LogoutButton";

function CompanyDashBoard() {
    const [currentUser, setCurrentUser] = useState(null);
    const [internships, setInternships] = useState([]);
    const [activeTab, setActiveTab] = useState("all");

    const navigate = useNavigate();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('currentUser'));
        const storedInternships = JSON.parse(localStorage.getItem('postedInternships')) || [];

        if (!userData) {
            navigate('/');
            return;
        }

        setCurrentUser(userData);
        setInternships(storedInternships);
    }, [navigate]);

    const renderTabs = () => (
        <div className="d-flex gap-3 mb-3 mt-0"> {/* Removed extra margin-top */}
            <Button
                variant={activeTab === "all" ? "primary" : "outline-primary"}
                onClick={() => setActiveTab("all")}
            >
                All Internships
            </Button>
            <Button
                variant={activeTab === "my" ? "primary" : "outline-primary"}
                onClick={() => setActiveTab("my")}
            >
                My Internships
            </Button>
            <Button
                variant={activeTab === "post" ? "primary" : "outline-primary"}
                onClick={() => setActiveTab("post")}
            >
                Post an Internship
            </Button>
        </div>
    );

    const renderInternshipCards = (data) => {
        if (data.length === 0) {
            return <p className="mt-3">No internships available.</p>;
        }

        return (
            <div className="d-flex flex-wrap gap-4 mt-3">
                {data.map((internship, index) => (
                    <Card key={index} style={{ width: '18rem' }}>
                        <Card.Body>
                            <Card.Title>{internship.title}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">{internship.location}</Card.Subtitle>
                            <Card.Text>{internship.description}</Card.Text>
                        </Card.Body>
                    </Card>
                ))}
            </div>
        );
    };

    const renderTabContent = () => {
        if (activeTab === "all") {
            return renderInternshipCards(internships);
        } else if (activeTab === "my") {
            const myPosts = internships.filter(i => i.companyId === currentUser.id);
            return renderInternshipCards(myPosts);
        } else if (activeTab === "post") {
            return <PostInternship userId={currentUser.id} />;
        }
    };

    return (
        <Container className="my-4">
            {/* Top-right logout button */}
            <Row>
                <Col className="d-flex justify-content-end">
                    <LogoutButton />
                </Col>
            </Row>

            {currentUser && (
                <>
                    {/* Profile with compact styling */}
                    <Profile user={currentUser} className="mb-1" />
                    
                    {/* Tabs immediately below profile */}
                    {renderTabs()}
                    
                    {/* Content */}
                    {renderTabContent()}
                </>
            )}
        </Container>
    );
}

export default CompanyDashBoard;