import React from 'react';
import logoHat from '../logo/logo1.png'; 
import logoText from '../logo/logo3.png';
import '../index.css';
const InteractiveLogo = () => {
  return (
    <div className="interactive-logo-container">
      <img src={logoText} alt="EatDish Text" className="interactive-logo-text" draggable={false} />
      <img src={logoHat} alt="EatDish Hat" className="interactive-logo-hat" draggable={false} />
    </div>
  );
};
export default InteractiveLogo;