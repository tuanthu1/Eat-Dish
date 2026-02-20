import React from 'react';
import '../index.css';
const Toast = ({ type = 'success', title, message, onClose }) => {
    const icons = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' };
    const titles = { success: 'Thành công!', error: 'Thất bại!', warning: 'Cảnh báo!', info: 'Thông báo' };

    return (
        <div className={`toast ${type}`}>
            <span className="material-icons toast-icon">{icons[type]}</span>
            <div className="toast-body">
                <h3 className="toast-title">{title || titles[type]}</h3>
                <p className="toast-message">{message}</p>
            </div>
            <span className="material-icons toast-close-btn" onClick={onClose}>close</span>
            <div className="toast-progress"></div>
        </div>
    );
};
export default Toast;