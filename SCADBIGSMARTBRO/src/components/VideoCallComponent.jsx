import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { BsMicFill, BsMicMuteFill, BsCameraVideoFill, BsCameraVideoOffFill, BsXLg, BsDisplay } from 'react-icons/bs';
import '../css/VideoCallComponent.css';

const VideoCallComponent = ({ 
  isVisible, 
  onHide, 
  callData, 
  isIncoming = false, 
  onAccept, 
  onReject 
}) => {
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [callStatus, setCallStatus] = useState(isIncoming ? 'incoming' : 'connected');
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const screenShareRef = useRef(null);

  // Simulate video streams
  useEffect(() => {
    if (!isVisible) return;

    // This is just a simulation - in a real app, you would use WebRTC
    const simulateLocalStream = () => {
      if (localVideoRef.current && isCameraOn) {
        // Simulation code
      }
    };
    
    const simulateRemoteStream = () => {
      // Simulation code
    };

    // Start simulations if not incoming or if call is accepted
    if (!isIncoming || callStatus === 'connected') {
      // Simulation code
    }

    // Cleanup function
    return () => {
      // Cleanup code
    };
  }, [isVisible, isCameraOn, callData, isIncoming, callStatus]);

  useEffect(() => {
    let localStream;
    if (isVisible && isCameraOn) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          localStream = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        });
    } else if (localVideoRef.current) {
      // Stop the camera if turning off
      const tracks = localVideoRef.current.srcObject?.getTracks?.() || [];
      tracks.forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }
    return () => {
      // Cleanup on unmount or when camera is turned off
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isVisible, isCameraOn]);

  // Handle accepting incoming call
  const handleAcceptCall = () => {
    setCallStatus('connected');
    if (onAccept) onAccept();
  };

  // Handle rejecting incoming call
  const handleRejectCall = () => {
    // Create a notification for the caller that their call was rejected
    createCallNotification('rejected');
    
    if (onReject) onReject();
  };

  // Handle ending the call
  const handleEndCall = () => {
    // Update call status in localStorage
    if (callData?.id) {
      const callHistory = JSON.parse(localStorage.getItem('callHistory') || '[]');
      const updatedCallHistory = callHistory.map(call => {
        if (call.id === callData.id) {
          return {
            ...call,
            endTime: new Date().toISOString(),
            status: 'ended'
          };
        }
        return call;
      });
      localStorage.setItem('callHistory', JSON.stringify(updatedCallHistory));
    }

    // Always send notification to the student when someone leaves the call
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { name: 'User' };
      const notification = {
        id: `call-${callData?.id || Date.now()}-ended`,
        title: 'Call Ended',
        message: `${currentUser.name} left the call${callData?.purpose ? ` regarding ${callData.purpose}` : ''}`,
        date: new Date().toISOString(),
        type: 'call',
        callId: callData?.id,
        callStatus: 'ended',
        remoteUser: currentUser.name,
        read: false
      };
      // Always push to studentNotifications
      const studentNotifications = JSON.parse(localStorage.getItem('studentNotifications') || '[]');
      studentNotifications.push(notification);
      localStorage.setItem('studentNotifications', JSON.stringify(studentNotifications));
      window.dispatchEvent(new CustomEvent('refresh-notifications'));
    } catch (error) {
      console.error('Error creating call notification:', error);
    }

    onHide();
  };

  // Create a call notification for the other party
  const createCallNotification = (status) => {
    try {
      // Get current user
      const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { name: 'User' };
      
      // Determine who should receive the notification (the other party)
      const isCompany = currentUser.role === 'company';
      const recipientRole = isCompany ? 'student' : 'company';
      
      // Create a notification object with custom message for call ending
      const notification = {
        id: `call-${callData?.id || Date.now()}-${status}`,
        title: status === 'ended' ? 'Call Ended' : 'Call Rejected',
        message: status === 'ended' 
          ? `${currentUser.name} left the call ${callData?.purpose ? `regarding ${callData.purpose}` : ''}`
          : `${currentUser.name} declined your call ${callData?.purpose ? `regarding ${callData.purpose}` : ''}`,
        date: new Date().toISOString(),
        type: 'call',
        callId: callData?.id,
        callStatus: status,
        remoteUser: currentUser.name,
        read: false
      };
      
      // Save notification based on recipient role
      const storageKey = recipientRole === 'company' ? 'companyNotifications' : 'studentNotifications';
      const existingNotifications = JSON.parse(localStorage.getItem(storageKey) || '[]');
      existingNotifications.push(notification);
      localStorage.setItem(storageKey, JSON.stringify(existingNotifications));
      
      // Dispatch a custom event to refresh notifications if the user is online
      window.dispatchEvent(new CustomEvent('refresh-notifications'));
      
      console.log(`Call ${status} notification created for ${recipientRole}`);
    } catch (error) {
      console.error('Error creating call notification:', error);
    }
  };

  // Add a function to handle screen sharing
  const handleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // Request screen share access
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        // If we have a screen share ref, update the stream
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = screenStream;
          
          // When user stops sharing (via browser UI), detect it
          screenStream.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false);
          };
        }
        
        setIsScreenSharing(true);
        
        // Simulate: In a real app, you'd send this stream to the remote peer
        console.log("Screen sharing started");
      } else {
        // Stop screen sharing
        if (screenShareRef.current && screenShareRef.current.srcObject) {
          const tracks = screenShareRef.current.srcObject.getTracks();
          tracks.forEach(track => track.stop());
          screenShareRef.current.srcObject = null;
        }
        
        setIsScreenSharing(false);
        console.log("Screen sharing stopped");
      }
    } catch (error) {
      console.error("Error sharing screen:", error);
      setIsScreenSharing(false);
    }
  };

  // Update the Modal to remove any redundant content
  return (
    <Modal
      show={isVisible}
      onHide={isIncoming && callStatus === 'incoming' ? onReject : onHide}
      backdrop="static"
      keyboard={false}
      centered
      dialogClassName="video-call-modal"
    >
      <Modal.Body className="p-0">
        {isIncoming && callStatus === 'incoming' ? (
          <div className="incoming-call-container" style={{ 
            paddingTop: "40px", 
            paddingBottom: "40px", 
            minHeight: "400px", 
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            animation: "none"
          }}>
            <div className="incoming-call-header" style={{ 
              marginTop: "0", 
              marginBottom: "20px",
              padding: "0 10px"
            }}>
              <h4 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px', color: 'white' }}>
                Incoming Video Call
              </h4>
              <p style={{ fontSize: '18px', color: 'white', marginBottom: '15px' }}>
                <strong>Regarding:</strong> {callData?.purpose || 'Appointment Call'}
              </p>
              <div className="caller-name" style={{ 
                marginBottom: '20px',
                backgroundColor: 'rgba(0,0,0,0.2)',
                padding: '8px 15px',
                borderRadius: '5px',
                display: 'inline-block',
                color: 'white',
                fontWeight: 'bold'
              }}>
                <i className="bi bi-person-circle me-2"></i>
                {callData?.remoteUser || 'SCAD Office'} is calling you
              </div>
            </div>
            <div className="incoming-call-actions" style={{ 
              marginTop: '20px',
              display: 'flex',
              justifyContent: 'center',
              gap: '15px'
            }}>
              <Button 
                variant="danger" 
                size="lg"
                onClick={handleRejectCall}
                style={{ fontWeight: '500', padding: '10px 20px' }}
              >
                <BsXLg className="me-2" /> Decline
              </Button>
              <Button 
                variant="success" 
                size="lg" 
                onClick={handleAcceptCall}
                style={{ fontWeight: '500', padding: '10px 20px' }}
              >
                <BsCameraVideoFill className="me-2" /> Accept
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="video-container">
              {isScreenSharing ? (
                // Show screen share video when active
                <div className="screen-share-wrapper">
                  <video 
                    ref={screenShareRef} 
                    className="screen-share-video" 
                    autoPlay 
                    playsInline
                  />
                  <div className="screen-share-label">
                    Screen Share Active
                  </div>
                </div>
              ) : (
                // Show the remote video when not screen sharing
                <div className="remote-video-wrapper">
                  <video 
                    ref={remoteVideoRef} 
                    className="remote-video" 
                    autoPlay 
                    playsInline
                  />
                  <div className="remote-user-name">
                    {callData?.remoteUser || 'Remote User'}
                  </div>
                </div>
              )}
              <div className="local-video-wrapper">
                <video 
                  ref={localVideoRef} 
                  className="local-video" 
                  autoPlay 
                  muted 
                  playsInline
                />
                <div className="local-user-name">
                  [You]
                </div>
              </div>
            </div>
            
            <div className="video-call-controls">
              <Button 
                variant={isMicOn ? "light" : "secondary"} 
                className="control-btn"
                onClick={() => setIsMicOn(!isMicOn)}
              >
                {isMicOn ? <BsMicFill /> : <BsMicMuteFill />}
              </Button>
              <Button 
                variant={isCameraOn ? "light" : "secondary"} 
                className="control-btn"
                onClick={() => setIsCameraOn(!isCameraOn)}
              >
                {isCameraOn ? <BsCameraVideoFill /> : <BsCameraVideoOffFill />}
              </Button>
              <Button 
                variant={isScreenSharing ? "primary" : "light"}
                className="control-btn"
                onClick={handleScreenShare}
              >
                <BsDisplay />
              </Button>
              <Button 
                variant="danger" 
                className="control-btn"
                onClick={handleEndCall}
              >
                <BsXLg /> End Call
              </Button>
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default VideoCallComponent;