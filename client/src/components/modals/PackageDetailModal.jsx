import React from 'react';
import Modal from '../Modal';
import { format } from 'date-fns';
import { Crown, CheckCircle, Calendar } from 'lucide-react'; // Lôi icon từ Lucide ra cho sang

const PackageDetailModal = ({ isOpen, onClose, packageInfo, pkg, onSubscribe }) => {
    // Nếu không mở hoặc truyền thiếu data thì tàng hình
    const data = packageInfo || pkg;
    if (!isOpen || !data) return null;

    // Hàm chuyển số thành tiền VNĐ (VD: 99000 -> 99.000 ₫)
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Hàm tính ngày hết hạn dựa trên duration_days
    const getExpiryDate = () => {
        const today = new Date();
        const durationDays = data.duration_days || 30;
        const expiryDate = new Date(today.getTime() + durationDays * 24 * 60 * 60 * 1000);
        return format(expiryDate, 'dd/MM/yyyy');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết gói Premium">
            <div className="package-detail-body" style={{ color: '#333', padding: '10px' }}>
                
                {/* Phần Header: Icon Vương Miện và Giá tiền */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        backgroundColor: '#fff3e0', // Nền cam nhạt
                        padding: '15px', 
                        borderRadius: '50%', 
                        marginBottom: '10px' 
                    }}>
                        <Crown size={40} color="#ff9f1c" />
                    </div>
                    <h2 style={{ margin: '0', color: '#ff9f1c', fontSize: '26px' }}>
                        {data.name || 'Gói Premium VIP'}
                    </h2>
                    <h3 style={{ margin: '10px 0 0 0', color: '#d35400', fontSize: '22px' }}>
                        {formatCurrency(data.price || 0)} 
                        <span style={{ fontSize: '14px', color: '#777', fontWeight: 'normal' }}>
                            {' / '}{data.durationInMonths || Math.max(1, Math.round((data.duration_days || 30) / 30))} tháng
                        </span>
                    </h3>
                    <div style={{ marginTop: '8px', color: '#ff9f1c', fontWeight: 700, fontSize: '14px' }}>
                        Mức gói: {data.level ?? 1}
                    </div>
                    
                    {/* Hiển thị ngày hết hạn */}
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#27ae60', fontSize: '14px', fontWeight: '500' }}>
                        <Calendar size={16} />
                        <span>Hết hạn ngày: <strong>{getExpiryDate()}</strong></span>
                    </div>
                </div>

                {/* Phần Box Đặc quyền */}
                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', marginBottom: '25px', border: '1px solid #eee' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#444' }}>Đặc quyền của bạn:</h4>
                    
                    <ul style={{ listStyle: 'none', padding: '0', margin: '0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CheckCircle size={20} color="#27ae60" />
                            <span>Mở khóa tất cả công thức độc quyền.</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CheckCircle size={20} color="#27ae60" />
                            <span>Trò chuyện không giới hạn với Trợ lý ảo AI.</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CheckCircle size={20} color="#27ae60" />
                            <span>Sở hữu huy hiệu VIP hoàng gia cực ngầu.</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CheckCircle size={20} color="#27ae60" />
                            <span>Trải nghiệm mượt mà, không quảng cáo.</span>
                        </li>
                    </ul>

                    {/* Lấy mô tả chi tiết từ Database nếu có */}
                    {data.description && (
                         <p style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #ccc', fontSize: '14px', fontStyle: 'italic', color: '#666', lineHeight: '1.5' }}>
                             "{data.description}"
                         </p>
                    )}
                </div>

                {/* Cụm Nút Bấm Thanh Toán */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: '#f1f1f1',
                            color: '#555',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'background 0.2s'
                        }}
                    >
                        Đóng
                    </button>
                </div>

            </div>
        </Modal>
    );
};

export default PackageDetailModal;