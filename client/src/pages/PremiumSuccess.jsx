import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import '../index.css'; 

const PremiumSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Khai báo các State 
    const [packageName, setPackageName] = useState('Premium');
    const [benefits, setBenefits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [premiumInfo, setPremiumInfo] = useState({
            expireDate: null
    });
    const formatExpiryDate = (dateString) => {
        if (!dateString) return 'Vĩnh viễn (Trọn đời)';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    useEffect(() => {
    const fetchPackageDetails = async () => {
        try {
            const userStr = localStorage.getItem('eatdish_user');
            if (userStr) {
                const userObj = JSON.parse(userStr);
                userObj.is_premium = 1;
                localStorage.setItem('eatdish_user', JSON.stringify(userObj));
            }
            const packageId = searchParams.get('packageId');
            const resPkgs = await axiosClient.get('/packages');
            let boughtPackage = resPkgs.data.find(p => p.id == packageId);
            if (boughtPackage) {
                setPackageName(boughtPackage.name);
                setBenefits(typeof boughtPackage.benefits === 'string' ? JSON.parse(boughtPackage.benefits) : boughtPackage.benefits);
            }
            try {
                    const resStatus = await axiosClient.get(`/status?t=${Date.now()}`);
                    setPremiumInfo({
                        expireDate: resStatus.data.premium_until
                    });
                } catch (statusErr) {
                    console.log("Khách chưa đăng nhập hoặc lỗi lấy trạng thái VIP");
                }
        } catch (err) {
            console.error("Lỗi cập nhật ngày thành công:", err);
        } finally {
            setIsLoading(false);
        }
    };
    fetchPackageDetails();
}, [searchParams]);

    return (
        <div className="premium-success-container">
            <div className="premium-success-card fadeIn">
                <div className="premium-icon">🎉</div>
                <h1 className="premium-title">THANH TOÁN THÀNH CÔNG!</h1>
                <p className="premium-desc">
                    Chào mừng Bếp Trưởng V.I.P. Tài khoản của bạn đã được nâng cấp <b>{packageName}</b>.
                </p>

                {/*  HẠN DÙNG */}
                <div style={{
                    backgroundColor: '#fff4e6', color: '#d35400', padding: '10px', 
                    borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold',
                    textAlign: 'center', border: '1px solid #ffe0b2'
                }}>
                    🗓️ Hạn dùng đến ngày: {formatExpiryDate(premiumInfo.expireDate) || 'Đang cập nhật...'}
                </div>
                
                <div className="premium-info-box">
                    {isLoading ? (
                        <p>Đang tải đặc quyền... </p>
                    ) : benefits && benefits.length > 0 ? (
                        benefits.map((item, index) => (
                            <p key={index}>✅ {item}</p>
                        ))
                    ) : (
                        <>
                            <p>✅ Đã mở khóa tất cả công thức</p>
                            <p>✅ Trải nghiệm tính năng VIP không quảng cáo</p>
                        </>
                    )}
                </div>

                <button 
                    onClick={() => {
                        window.location.href = "/"; 
                    }} 
                    className="premium-btn"
                >
                    Bắt đầu trải nghiệm ngay
                </button>
            </div>
        </div>
    );
};

export default PremiumSuccess;