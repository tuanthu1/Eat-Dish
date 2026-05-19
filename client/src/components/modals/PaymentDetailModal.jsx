import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { format } from 'date-fns'; // Dùng date-fns hoặc moment.js tùy project mày đang xài
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';

const PaymentDetailModal = ({ isOpen, onClose, transaction, payment, onStatusUpdated }) => {
    const [isSaving, setIsSaving] = useState(false);
    const data = transaction || payment;
    const [currentStatus, setCurrentStatus] = useState((data?.status || '').toString().toLowerCase());
    
    // Đồng bộ currentStatus với data.status khi data thay đổi
    useEffect(() => {
        if (data?.status) {
            setCurrentStatus(String(data.status).toLowerCase());
        }
    }, [data?.status, data?._id]);
    
    // Nếu không mở hoặc không có data giao dịch thì không render gì cả
    if (!isOpen || !data) return null;
    const paymentDate = data.createdAt || data.created_at || data.date || data.timestamp || null;
    // Hàm phụ: Format tiền tệ VNĐ
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Hàm phụ: Hiển thị trạng thái giao dịch
    const renderStatus = (status) => {
        switch (status) {
            case 'success':
            case 'paid':
            case 'PAID':
                return <span style={{ color: '#27ae60', fontWeight: 'bold', background: '#e8f8f5', padding: '4px 10px', borderRadius: '12px', fontSize: '14px' }}>Thành công</span>;
            case 'pending':
                return <span style={{ color: '#f39c12', fontWeight: 'bold', background: '#fef5e7', padding: '4px 10px', borderRadius: '12px', fontSize: '14px' }}>Đang chờ</span>;
            case 'failed':
                return <span style={{ color: '#e74c3c', fontWeight: 'bold', background: '#fdedec', padding: '4px 10px', borderRadius: '12px', fontSize: '14px' }}>Thất bại</span>;
            default:
                return <span>{status}</span>;
        }
    };

    const handleUpdateStatus = async (status) => {
        const orderId = data.order_id || data.transactionId || data._id;
        if (!orderId) {
            toast.error('Không tìm thấy mã giao dịch.');
            return;
        }

        try {
            setIsSaving(true);
            const res = await axiosClient.put(`/admin/history/${orderId}/status`, { status });
            if (res.data?.success) {
                toast.success((status === 'paid' || status === 'success') ? 'Đã xác nhận thanh toán và cấp Premium.' : 'Đã đánh dấu giao dịch thất bại.');
                // Update local status so buttons get disabled immediately if modal stays open
                setCurrentStatus(String(status).toLowerCase());
                onStatusUpdated?.(orderId, status);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái giao dịch.');
        } finally {
            setIsSaving(false);
        }
    };

    const isStatusLocked = ['success', 'paid', 'PAID', 'failed'].includes((currentStatus || '').toString());

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết giao dịch">
            <div className="payment-detail-body" style={{ color: '#333', lineHeight: '1.6' }}>
                
                {/* Phần Header Bill */}
                <div style={{ textAlign: 'center', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px dashed #ccc' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#ff9f1c', fontSize: '24px' }}>
                        {formatCurrency(data.amount || data.total || 0)}
                    </h3>
                    <div>{renderStatus(data.status)}</div>
                </div>

                {/* Phần Thông tin chi tiết */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#777' }}>Mã giao dịch:</span>
                        <span style={{ fontWeight: '500', fontFamily: 'monospace' }}>{data.transactionId || data.order_id || data._id}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#777' }}>Gói dịch vụ:</span>
                        <span style={{ fontWeight: 'bold' }}>{data.packageName || data.package_name || 'Premium VIP'}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#777' }}>Ngày thanh toán:</span>
                        <span>
                            {paymentDate
                                ? format(new Date(paymentDate), 'HH:mm - dd/MM/yyyy') 
                                : 'Đang cập nhật'}
                        </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#777' }}>Phương thức:</span>
                        <span>{data.paymentMethod || data.payment_method || 'VNPAY'}</span>
                    </div>
                </div>

                {/* Phần Nút bấm đóng */}
                <div style={{ marginTop: '30px', display: 'flex', gap: '10px', textAlign: 'center' }}>
                    {isStatusLocked ? (
                        <button
                            disabled
                            style={{
                                flex: 2,
                                padding: '10px 20px',
                                backgroundColor: currentStatus === 'failed' ? '#e74c3c' : '#27ae60',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'not-allowed',
                                fontWeight: 'bold',
                                boxShadow: currentStatus === 'failed' ? '0 4px 6px rgba(231, 76, 60, 0.15)' : '0 4px 6px rgba(39, 174, 96, 0.15)'
                            }}
                        >
                            {currentStatus === 'failed' ? 'Đã từ chối' : 'Đã xác nhận'}
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => handleUpdateStatus('failed')}
                                disabled={isSaving}
                                style={{
                                    flex: 1,
                                    padding: '10px 20px',
                                    backgroundColor: '#e74c3c',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: isSaving ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 6px rgba(231, 76, 60, 0.15)'
                                }}
                            >
                                Từ chối
                            </button>
                            <button
                                onClick={() => handleUpdateStatus('success')}
                                disabled={isSaving}
                                style={{
                                    flex: 1,
                                    padding: '10px 20px',
                                    backgroundColor: '#27ae60',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: isSaving ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 6px rgba(39, 174, 96, 0.15)'
                                }}
                            >
                                Xác nhận
                            </button>
                        </>
                    )}

                    <button 
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '10px 20px',
                            backgroundColor: '#ff9f1c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 6px rgba(255, 159, 28, 0.2)'
                        }}
                    >
                        Đóng
                    </button>
                </div>

            </div>
        </Modal>
    );
};

export default PaymentDetailModal;