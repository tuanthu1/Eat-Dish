import React from 'react';

const PaymentDetailModal = ({ isOpen, onClose, payment }) => {
    if (!isOpen || !payment) return null;

    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
    const isSuccess = payment.status === 'success';

    return (
        <div className="payment-overlay">
            <div className="payment-content">
                <div className="payment-header">
                    <h2 className="payment-title">Chi tiết hóa đơn</h2>
                    <button onClick={onClose} className="payment-close-btn">✕</button>
                </div>

                <div className="payment-body">
                    <div className="payment-row">
                        <span className="payment-label">Mã giao dịch:</span>
                        <span className="payment-value payment-order-id">#{payment.order_id}</span>
                    </div>
                    
                    <div className="payment-row">
                        <span className="payment-label">Khách hàng:</span>
                        <div style={{textAlign: 'right'}}>
                            <div className="payment-value" style={{fontSize: '15px'}}>{payment.fullname || payment.username}</div>
                            <small style={{color: '#a4b0be'}}>{payment.email}</small>
                        </div>
                    </div>

                    <div className="payment-divider"></div>

                    <div className="payment-row">
                        <span className="payment-label">Tổng thanh toán:</span>
                        <span className="payment-total-price">{formatCurrency(payment.amount)}</span>
                    </div>

                    <div className="payment-row">
                        <span className="payment-label">Trạng thái:</span>
                        <span className={`payment-status-badge ${isSuccess ? 'success' : 'failed'}`}>
                            {isSuccess ? 'THÀNH CÔNG' : (payment.status || 'THẤT BẠI').toUpperCase()}
                        </span>
                    </div>

                    <div className="payment-row">
                        <span className="payment-label">Thời gian:</span>
                        <span className="payment-value">{formatDate(payment.created_at)}</span>
                    </div>

                    <div className="payment-row">
                        <span className="payment-label">Phương thức:</span>
                        <span className="payment-value" style={{display: 'flex', alignItems: 'center', gap: '5px'}}>💳 PayOS (QR)</span>
                    </div>
                </div>

                <div className="payment-footer">
                    <button onClick={onClose} className="btn-payment-close">Đóng</button>
                </div>
            </div>
        </div>
    );
};
export default PaymentDetailModal;