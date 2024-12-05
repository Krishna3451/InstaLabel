import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faCamera, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "./FloatingButtons.css";

const FloatingButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="floating-buttons">
      <button className="button" style={{ background: 'transparent' }}>
        <FontAwesomeIcon icon={faUser} style={{ fontSize: '20px' }} />
      </button>
      <button 
        className="button center-button"
        onClick={() => navigate('/')}
      >
        <FontAwesomeIcon icon={faCamera} style={{ fontSize: '24px' }} />
      </button>
      <button 
        className="button" 
        style={{ background: 'transparent' }}
        onClick={() => navigate('/recent-scans')}
      >
        <FontAwesomeIcon icon={faRotateLeft} style={{ fontSize: '20px' }} />
      </button>
    </div>
  );
};

export default FloatingButtons; 