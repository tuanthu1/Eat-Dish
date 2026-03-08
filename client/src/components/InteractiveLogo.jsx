import React from 'react';
import logoHat from '../logo/logo1.png'; 
import logoText from '../logo/logo3.png';
import { Link } from 'react-router-dom';
import '../index.css';
const InteractiveLogo = () => {

  return (
    <div className="interactive-logo-container">
      <Link to="https://eatdish.net">
      <img src={logoText} alt="EatDish Text" className="interactive-logo-text" draggable={false} />
      <img src={logoHat} alt="EatDish Hat" className="interactive-logo-hat" draggable={false} />
      </Link>
    </div>
  );
};
export default InteractiveLogo;