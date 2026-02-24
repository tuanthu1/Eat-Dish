import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-overlay">
            <div className="fadeIn confirm-content">
                <h3 className="confirm-title">{title || "Xác nhận"}</h3>
                <p className="confirm-message">{message}</p>
                
                <div className="confirm-btn-row">
                    <button className="btn-confirm-yes" onClick={() => { onConfirm(); onClose();}}>Xác nhận</button>
                    <button className="btn-confirm-no" onClick={onClose}>Hủy</button>
                </div>
            </div>
        </div>
    );
};
export default ConfirmModal;