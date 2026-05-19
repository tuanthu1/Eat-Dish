import React from 'react';
import Modal from '../Modal';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="confirm-modal-body">
                {/* Hiển thị câu hỏi xác nhận (Ví dụ: Chắc chắn xóa món này không?) */}
                <p style={{ 
                    marginBottom: '20px', 
                    color: '#444', 
                    fontSize: '16px', 
                    lineHeight: '1.5' 
                }}>
                    {message}
                </p>
                
                {/* Cụm nút bấm Hủy / Xác nhận */}
                <div className="modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button 
                        className="btn-confirm-no"
                        onClick={onClose}
                    >
                        Hủy
                    </button>
                    
                    <button 
                        className="btn-confirm-yes" 
                        onClick={(e) => {
                            // Gọi hàm xử lý từ component cha truyền xuống
                            onConfirm(e); 
                        }}
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;