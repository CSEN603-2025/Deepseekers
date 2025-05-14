import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { BsStarFill, BsStar, BsGeoAlt, BsPeopleFill, BsTagsFill, BsInfoCircle } from 'react-icons/bs';

const RecommendedCompanies = ({ studentInterests, studentMajor, onSetInterests }) => {
  const [companies, setCompanies] = useState([]);
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [newInterests, setNewInterests] = useState(studentInterests);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Predefined list of available interests for selection
  const availableInterests = [
    'Web Development', 'Mobile Apps', 'Data Science', 'UI/UX Design', 
    'Cloud Computing', 'Cybersecurity', 'Machine Learning', 'Game Development',
    'Blockchain', 'DevOps', 'Quality Assurance', 'Project Management',
    'Digital Marketing', 'E-commerce', 'Fintech', 'Healthcare IT'
  ];

  // Dummy company data
  const dummyCompanies = [
    {
      id: 1,
      name: 'Microsoft Egypt',
      logo: 'https://logo.clearbit.com/microsoft.com',
      rating: 4.8,
      location: 'Cairo',
      industry: 'Technology',
      interests: ['Cloud Computing', 'Web Development', 'Data Science'],
      recommendedCount: 15,
      description: 'Microsoft Egypt offers advanced tech internships with hands-on experience in cloud computing and software development.',
      matchReason: 'Matches your interest in Web Development and Data Science',
      reviews: [
        { author: 'Ahmed S.', text: 'Great learning experience with supportive mentors.', rating: 5 },
        { author: 'Mona T.', text: 'Excellent work environment and challenging projects.', rating: 4.5 }
      ]
    },
    {
      id: 2,
      name: 'IBM Egypt',
      logo: 'https://logo.clearbit.com/ibm.com',
      rating: 4.7,
      location: 'Cairo',
      industry: 'Technology',
      interests: ['AI', 'Machine Learning', 'Cloud Computing'],
      recommendedCount: 12,
      description: 'IBM Egypt provides cutting-edge internships focusing on AI and machine learning technologies.',
      matchReason: 'Past DMET interns highly recommend this company',
      reviews: [
        { author: 'Tarek M.', text: 'Great exposure to AI tools and research papers.', rating: 5 },
        { author: 'Sara H.', text: 'Professional environment with lots to learn.', rating: 4 }
      ]
    },
    {
      id: 3,
      name: 'Vodafone',
      logo: 'https://logo.clearbit.com/vodafone.com',
      rating: 4.6,
      location: 'Cairo',
      industry: 'Telecommunications',
      interests: ['Mobile Apps', 'Data Science', 'Network Engineering'],
      recommendedCount: 14,
      description: 'Vodafone offers telecommunications-focused internships with exposure to mobile application development and data analytics.',
      matchReason: 'Matches your interest in Mobile Apps',
      reviews: [
        { author: 'Yara K.', text: 'Excellent mentoring program for mobile development.', rating: 5 },
        { author: 'Omar F.', text: 'Great team culture and learning opportunities.', rating: 4 }
      ]
    },
    {
      id: 4,
      name: 'Amazon Development Center',
      logo: 'https://logo.clearbit.com/amazon.com',
      rating: 4.4,
      location: 'Cairo',
      industry: 'Technology',
      interests: ['Web Development', 'Cloud Computing', 'E-commerce'],
      recommendedCount: 8,
      description: 'Amazon Development Center offers challenging projects in web development, cloud services, and e-commerce platforms.',
      matchReason: 'Matches your interest in Web Development',
      reviews: [
        { author: 'Mariam L.', text: 'Challenging projects with excellent mentorship.', rating: 4 },
        { author: 'Karim S.', text: 'High standards but great for career growth.', rating: 5 }
      ]
    },
    {
      id: 5,
      name: 'Orange',
      logo: 'https://logo.clearbit.com/orange.com',
      rating: 4.5,
      location: 'Cairo',
      industry: 'Telecommunications',
      interests: ['Network Engineering', 'Mobile Apps', 'IoT'],
      recommendedCount: 10,
      description: 'Orange provides internships in network engineering and IoT development with exposure to real-world telecommunications challenges.',
      matchReason: 'Past interns from your major had positive experiences',
      reviews: [
        { author: 'Hossam R.', text: 'Great hands-on experience with networking technologies.', rating: 4.5 },
        { author: 'Nada T.', text: 'Supportive team and relevant projects.', rating: 4.5 }
      ]
    },
    {
      id: 6,
      name: 'Dell EMC',
      logo: 'https://logo.clearbit.com/dell.com',
      rating: 4.3,
      location: 'Cairo',
      industry: 'Technology',
      interests: ['Cloud Computing', 'Data Storage', 'Infrastructure'],
      recommendedCount: 9,
      description: 'Dell EMC offers technical internships in cloud infrastructure and data storage solutions.',
      matchReason: 'Popular choice for DMET students',
      reviews: [
        { author: 'Ramy K.', text: 'Great exposure to enterprise-level systems.', rating: 4 },
        { author: 'Laila M.', text: 'Well-structured internship program with clear goals.', rating: 4.5 }
      ]
    },
    {
      id: 7,
      name: 'Valeo',
      logo: 'https://logo.clearbit.com/valeo.com',
      rating: 4.2,
      location: 'Cairo',
      industry: 'Automotive',
      interests: ['Embedded Systems', 'IoT', 'Automotive Software'],
      recommendedCount: 7,
      description: 'Valeo offers internships in automotive software development and embedded systems.',
      matchReason: 'Recommended for students interested in embedded systems',
      reviews: [
        { author: 'Amir H.', text: 'Great for those interested in embedded software.', rating: 4 },
        { author: 'Dina G.', text: 'Good technical challenges and learning opportunities.', rating: 4.5 }
      ]
    }
  ];

  useEffect(() => {
    // Simple logic to filter and sort companies based on student interests and major
    const filterAndSortCompanies = () => {
      // Initialize a score for each company
      const scoredCompanies = dummyCompanies.map(company => {
        let score = 0;
        
        // Add score for each matching interest
        studentInterests.forEach(interest => {
          if (company.interests.includes(interest)) {
            score += 10;
          }
        });
        
        // Extra score for companies that have many recommendations
        score += company.recommendedCount;
        
        // Bonus points for highly rated companies
        score += company.rating * 2;
        
        // Special cases based on major
        if (studentMajor === 'DMET' && (company.name === 'IBM Egypt' || company.name === 'Dell EMC')) {
          score += 5; // Bonus for DMET students
        }
        
        if (studentMajor === 'MET' && (company.name === 'Valeo' || company.name === 'Microsoft Egypt')) {
          score += 5; // Bonus for MET students
        }
        
        return { ...company, score };
      });
      
      // Sort by score (descending)
      return scoredCompanies.sort((a, b) => b.score - a.score);
    };
    
    setCompanies(filterAndSortCompanies());
  }, [studentInterests, studentMajor]);

  const handleUpdateInterests = () => {
    onSetInterests(newInterests);
    setShowInterestsModal(false);
  };

  const handleInterestToggle = (interest) => {
    if (newInterests.includes(interest)) {
      setNewInterests(newInterests.filter(i => i !== interest));
    } else {
      setNewInterests([...newInterests, interest]);
    }
  };

  const handleViewCompanyDetails = (company) => {
    setSelectedCompany(company);
    setShowDetailsModal(true);
  };

  return (
    <>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5>Your Interests</h5>
              <div>
                {studentInterests.map((interest, index) => (
                  <Badge key={index} bg="primary" className="me-2 mb-2">{interest}</Badge>
                ))}
              </div>
            </div>
            <Button variant="outline-primary" onClick={() => setShowInterestsModal(true)}>
              Edit Interests
            </Button>
          </div>
        </Col>
      </Row>

      <Row xs={1} md={2} lg={3} className="g-4">
        {companies.map((company) => (
          <Col key={company.id}>
            <Card className="h-100 company-card">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <div className="company-logo me-3">
                    <img src={company.logo} alt={company.name} width="50" height="50" />
                  </div>
                  <div>
                    <Card.Title className="mb-0">{company.name}</Card.Title>
                    <div className="text-warning">
                      {[...Array(Math.floor(company.rating))].map((_, i) => (
                        <BsStarFill key={i} className="me-1" />
                      ))}
                      {company.rating % 1 > 0 && <BsStarFill className="me-1" style={{ opacity: 0.5 }} />}
                      <small className="text-muted ms-1">({company.rating})</small>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <BsGeoAlt className="me-2 text-muted" />
                    <small>{company.location}</small>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <BsTagsFill className="me-2 text-muted" />
                    <small>{company.industry}</small>
                  </div>
                  <div className="d-flex align-items-center">
                    <BsPeopleFill className="me-2 text-muted" />
                    <small>{company.recommendedCount} past interns recommend</small>
                  </div>
                </div>
                
                <div className="mb-3">
                  <small className="text-success">
                    <BsInfoCircle className="me-1" /> {company.matchReason}
                  </small>
                </div>
                
                <div className="interests-tags mb-3">
                  {company.interests.slice(0, 2).map((interest, idx) => (
                    <Badge 
                      key={idx} 
                      bg={studentInterests.includes(interest) ? 'success' : 'secondary'}
                      className="me-2"
                    >
                      {interest}
                    </Badge>
                  ))}
                  {company.interests.length > 2 && (
                    <Badge bg="light" text="dark">+{company.interests.length - 2}</Badge>
                  )}
                </div>
              </Card.Body>
              <Card.Footer className="bg-white border-top-0">
                <Button 
                  variant="outline-primary" 
                  className="w-100"
                  onClick={() => handleViewCompanyDetails(company)}
                >
                  View Company Details
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Interests Selection Modal */}
      <Modal show={showInterestsModal} onHide={() => setShowInterestsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Your Interests</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">
            Select your career interests to get better company recommendations
          </p>
          <div className="d-flex flex-wrap">
            {availableInterests.map((interest, index) => (
              <Button
                key={index}
                variant={newInterests.includes(interest) ? "primary" : "outline-primary"}
                size="sm"
                className="me-2 mb-2"
                onClick={() => handleInterestToggle(interest)}
              >
                {interest}
              </Button>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInterestsModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateInterests}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Company Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        {selectedCompany && (
          <>
            <Modal.Header closeButton>
              <Modal.Title className="d-flex align-items-center">
                <img 
                  src={selectedCompany.logo} 
                  alt={selectedCompany.name} 
                  width="40" 
                  height="40" 
                  className="me-3" 
                />
                {selectedCompany.name}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row className="mb-4">
                <Col md={8}>
                  <h5>About the Company</h5>
                  <p>{selectedCompany.description}</p>
                  <div className="mb-3">
                    <h6>Why we recommend this company:</h6>
                    <p className="text-success">
                      <BsInfoCircle className="me-2" /> 
                      {selectedCompany.matchReason}
                    </p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="company-info-box p-3 bg-light rounded">
                    <div className="d-flex align-items-center mb-3">
                      <div className="text-warning me-2">
                        {[...Array(Math.floor(selectedCompany.rating))].map((_, i) => (
                          <BsStarFill key={i} className="me-1" />
                        ))}
                        {selectedCompany.rating % 1 > 0 && <BsStarFill className="me-1" style={{ opacity: 0.5 }} />}
                      </div>
                      <div>{selectedCompany.rating} stars</div>
                    </div>
                    
                    <div className="mb-2">
                      <strong>Location:</strong> {selectedCompany.location}
                    </div>
                    
                    <div className="mb-2">
                      <strong>Industry:</strong> {selectedCompany.industry}
                    </div>
                    
                    <div className="mb-2">
                      <strong>Recommended by:</strong> {selectedCompany.recommendedCount} past interns
                    </div>
                  </div>
                </Col>
              </Row>
              
              <h5>Areas of Interest</h5>
              <div className="mb-4">
                {selectedCompany.interests.map((interest, idx) => (
                  <Badge 
                    key={idx} 
                    bg={studentInterests.includes(interest) ? 'success' : 'secondary'}
                    className="me-2 mb-2 p-2"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
              
              <h5>Feedback from Past Interns</h5>
              {selectedCompany.reviews.map((review, index) => (
                <Card key={index} className="mb-3">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <div className="reviewer-name">
                        <strong>{review.author}</strong>
                      </div>
                      <div className="review-rating text-warning">
                        {[...Array(Math.floor(review.rating))].map((_, i) => (
                          <BsStarFill key={i} className="me-1" />
                        ))}
                        {review.rating % 1 > 0 && <BsStarFill className="me-1" style={{ opacity: 0.5 }} />}
                        <span className="text-muted ms-1">({review.rating})</span>
                      </div>
                    </div>
                    <p className="mb-0 mt-2">{review.text}</p>
                  </Card.Body>
                </Card>
              ))}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </>
  );
};

export default RecommendedCompanies;