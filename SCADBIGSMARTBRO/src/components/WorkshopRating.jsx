import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const WorkshopRating = ({ workshopId, workshopTitle, onSubmitRating }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleRatingChange = (e) => {
    setRating(parseInt(e.target.value, 10));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare the rating data
    const ratingData = {
      workshopId,
      workshopTitle,
      rating,
      feedback,
      submittedAt: new Date().toISOString(),
    };
    
    // Call the parent component's submission handler
    onSubmitRating(ratingData);
    
    // Show success message
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
      setFeedback('');
    }, 3000);
  };

  // Helper function to get the label for a rating value
  const getRatingLabel = (value) => {
    switch(value) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Average";
      case 4: return "Good";
      case 5: return "Great";
      default: return "";
    }
  };

  return (
    <div className="workshop-rating-container p-4">
      {submitted ? (
        <div className="text-center py-4">
          <i className="bi bi-check-circle-fill text-success display-4"></i>
          <h5 className="mt-3">Thank you for your feedback!</h5>
          <p className="text-muted">Your rating has been submitted successfully.</p>
        </div>
      ) : (
        <>
          <h5 className="mb-2">Rate this Workshop</h5>
          <h6 className="mb-4 text-muted">{workshopTitle}</h6>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="d-block fw-bold">Rating</Form.Label>
              
              <div className="rating-buttons">
                <div className="d-flex align-items-center mb-2">
                  <div className="rating-scale">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <div key={value} className="rating-option">
                        <Form.Check
                          type="radio"
                          id={`rating-${value}`}
                          name="rating"
                          value={value}
                          checked={rating === value}
                          onChange={handleRatingChange}
                          label={value}
                          className="rating-radio"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="d-flex justify-content-between px-2">
                  <span className="rating-label">Poor</span>
                  <span className="rating-label">Great</span>
                </div>
                
                {rating > 0 && (
                  <div className="selected-rating mt-2">
                    You selected: <strong>{rating} - {getRatingLabel(rating)}</strong>
                  </div>
                )}
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Your Feedback</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Share your thoughts about this workshop..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </Form.Group>

            <div className="text-start">
              <Button
                variant="success"
                type="submit"
                disabled={rating === 0}
                className="px-4"
              >
                Submit Feedback
              </Button>
            </div>
          </Form>
        </>
      )}
    </div>
  );
};

export default WorkshopRating;