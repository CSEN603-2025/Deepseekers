import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, ProgressBar, Form, Modal } from 'react-bootstrap';
import WorkshopRating from './WorkshopRating';
import '../css/workshopRating.css';

const PrerecordedWorkshops = ({ studentId }) => {
  // Sample pre-recorded workshops data
  const prerecordedWorkshops = [
    {
      id: 1,
      title: "Resume Building Masterclass",
      instructor: "Dr. Sarah Johnson",
      duration: "45 minutes",
      description: "Learn how to craft a standout resume that will catch employers' attention and highlight your skills effectively.",
      videoUrl: "https://www.youtube.com/embed/GuLTMSD3SVM"
    },
    {
      id: 2,
      title: "Technical Interview Preparation",
      instructor: "Prof. Michael Chen",
      duration: "60 minutes",
      description: "Master the essential skills for technical interviews including problem-solving approaches and coding challenges.",
      videoUrl: "https://www.youtube.com/embed/1qw5ITr3k9E"
    }
  ];

  const [activeWorkshop, setActiveWorkshop] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [completedWorkshops, setCompletedWorkshops] = useState([]);
  const [workshopToRate, setWorkshopToRate] = useState(null);

  const handlePlayWorkshop = (workshop) => {
    setActiveWorkshop(workshop);
    setIsPlaying(true);
    // Reset progress when starting a new workshop
    setProgress(0);
    // Load any previously saved notes for this workshop
    const savedNotes = localStorage.getItem(`prerecorded-notes-${workshop.id}`);
    if (savedNotes) {
      setNotes(savedNotes);
    } else {
      setNotes('');
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const stopWorkshop = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const toggleNotes = () => {
    setShowNotes(!showNotes);
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
    // Auto-save notes as user types
    if (activeWorkshop) {
      localStorage.setItem(`prerecorded-notes-${activeWorkshop.id}`, e.target.value);
    }
  };

  // Simulate progress updates (in a real app, this would be tied to the video player's actual progress)
  React.useEffect(() => {
    let interval;
    if (isPlaying && activeWorkshop) {
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress = prevProgress + 1;
          if (newProgress >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 100;
          }
          return newProgress;
        });
      }, 1000); // Update every second
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, activeWorkshop]);

  const handleCloseWorkshop = () => {
    // Save notes before closing
    if (activeWorkshop && notes.trim()) {
      localStorage.setItem(`prerecorded-notes-${activeWorkshop.id}`, notes);
    }
    
    // Store the active workshop to rate it
    setWorkshopToRate(activeWorkshop);
    
    // Close the workshop player
    setActiveWorkshop(null);
    setShowNotes(false);
    
    // Show rating form if the workshop hasn't been rated yet
    if (activeWorkshop && !completedWorkshops.includes(activeWorkshop.id)) {
      setShowRatingForm(true);
    }
  };

  const handleSubmitRating = (ratingData) => {
    console.log('Rating submitted:', ratingData);
    // Here you would typically send this data to your backend
    
    // Add workshop to completed list so we don't ask for rating again
    setCompletedWorkshops([...completedWorkshops, ratingData.workshopId]);
    
    // Close the rating form after a short delay
    setTimeout(() => {
      setShowRatingForm(false);
      setWorkshopToRate(null);
    }, 1500);
  };

  return (
    <div className="prerecorded-workshops">
      <h4 className="mb-4">Pre-recorded Workshops</h4>
      
      {activeWorkshop ? (
        <div className="active-workshop mb-4">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">{activeWorkshop.title}</h5>
                <small>{activeWorkshop.instructor} • {activeWorkshop.duration}</small>
              </div>
              <div>
                <Button 
                  variant={showNotes ? "primary" : "outline-primary"}
                  onClick={toggleNotes}
                  className="notes-toggle-btn me-2"
                >
                  <i className="bi bi-journal-text me-1"></i>
                  Notes
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={handleCloseWorkshop}
                >
                  <i className="bi bi-x-lg"></i> Close
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <Row className="g-0">
                {showNotes && (
                  <Col md={3} className="notes-sidebar">
                    <div className="notes-container d-flex flex-column h-100">
                      <div className="notes-header p-2 bg-light border-bottom">
                        <h6 className="mb-0">Workshop Notes</h6>
                        <small className="text-muted">Notes are saved automatically</small>
                      </div>
                      <Form.Control
                        as="textarea"
                        placeholder="Take notes here..."
                        value={notes}
                        onChange={handleNotesChange}
                        className="notes-textarea flex-grow-1 border-0 rounded-0"
                      />
                    </div>
                  </Col>
                )}
                <Col md={showNotes ? 9 : 12}>
                  <div className="ratio ratio-16x9">
                    <iframe
                      src={`${activeWorkshop.videoUrl}?autoplay=${isPlaying ? 1 : 0}`}
                      title={activeWorkshop.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="playback-controls p-3">
                    <ProgressBar now={progress} label={`${progress}%`} className="mb-2" />
                    <div className="d-flex justify-content-between">
                      <Button 
                        variant={isPlaying ? "warning" : "success"} 
                        onClick={togglePlayPause}
                      >
                        <i className={`bi ${isPlaying ? "bi-pause-fill" : "bi-play-fill"} me-1`}></i>
                        {isPlaying ? "Pause" : "Play"}
                      </Button>
                      <Button 
                        variant="danger" 
                        onClick={stopWorkshop}
                      >
                        <i className="bi bi-stop-fill me-1"></i>
                        Stop
                      </Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>
      ) : (
        <p>Select a workshop to start watching:</p>
      )}

      <Row xs={1} md={2} className="g-4">
        {prerecordedWorkshops.map(workshop => (
          <Col key={workshop.id}>
            <Card className="h-100">
              <Card.Body>
                <Card.Title>{workshop.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {workshop.instructor} • {workshop.duration}
                </Card.Subtitle>
                <Card.Text>{workshop.description}</Card.Text>
                <Button 
                  variant="primary" 
                  onClick={() => handlePlayWorkshop(workshop)}
                >
                  <i className="bi bi-play-circle me-1"></i>
                  Watch Workshop
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Workshop Rating Modal */}
      <Modal
        show={showRatingForm}
        onHide={() => setShowRatingForm(false)}
        centered
      >
        <Modal.Body className="p-0">
          <WorkshopRating 
            workshopId={workshopToRate?.id} 
            workshopTitle={workshopToRate?.title}
            onSubmitRating={handleSubmitRating}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PrerecordedWorkshops;