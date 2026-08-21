import React from 'react';
import '../../sass/componentsass/RoundButton.scss';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook

const RoundButton = () => {
  let navigate = useNavigate(); // Get the instance of navigate

  function handleClick() {
    navigate('/home'); // Navigate to the home page
  }

  return (
    <button className="round-button" onClick={handleClick}>
      <span className="tap">TAP</span>
      <span>to</span>
      <span>Start</span>
    </button>
  );
};

export default RoundButton;