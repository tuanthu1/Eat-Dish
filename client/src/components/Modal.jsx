import React from 'react';
import '../index.css';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal show"> 
      
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close-btn" onClick={onClose}>&times;</span>
        
        <h3 className="modal-header-title">{title}</h3>
        {children}
      </div>
      
    </div>
  );
};

export default Modal;