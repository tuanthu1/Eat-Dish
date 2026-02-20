import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import '../index.css'; 

const PremiumSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const [packageName, setPackageName] = useState('Premium');
    const [benefits, setBenefits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPackageDetails = async () => {
            try {
                // 1. Cập nhật LocalStorage ngay lập tức để mở khóa giao diện VIP cho User
                const userStr = localStorage.getItem('eatdish_user');
                if (userStr) {
                    const userObj = JSON.parse(userStr);
                    userObj.is_premium = 1; // Bật cờ VIP
                    localStorage.setItem('eatdish_user', JSON.stringify(userObj));
                    localStorage.setItem('user', JSON.stringify(userObj));
                }

                // 2. Lấy ID gói vừa mua từ URL (Ví dụ: /payment-success?packageId=2)
                // (Nếu cổng thanh toán của bạn không trả về packageId, nó sẽ tự động lấy gói đầu tiên)
                const packageId = searchParams.get('packageId');

                // 3. Gọi API lấy danh sách gói từ Database
                const res = await axiosClient.get('/packages');
                const packagesList = res.data;

                let boughtPackage = packagesList.find(p => p.is_active === 1) || packagesList[0]; 
                
                if (packageId) {
                    const found = packagesList.find(p => p.id == packageId);
                    if (found) boughtPackage = found;
                }

                if (boughtPackage) {
                    setPackageName(boughtPackage.name);
                    
                    // Parse cột 'benefits' từ dạng chuỗi JSON trong DB thành Mảng (Array)
                    let parsedBenefits = [];
                    try {
                        parsedBenefits = typeof boughtPackage.benefits === 'string' 
                            ? JSON.parse(boughtPackage.benefits) 
                            : boughtPackage.benefits;
                    } catch (e) {
                        console.error("Lỗi parse quyền lợi:", e);
                    }
                    setBenefits(parsedBenefits || []);
                }
            } catch (err) {
                console.error("Lỗi tải thông tin gói:", err);
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
                
                <div className="premium-info-box">
                    {isLoading ? (
                        <p>Đang tải đặc quyền... </p>
                    ) : benefits.length > 0 ? (
                        benefits.map((item, index) => (
                            <p key={index}>✅ {item}</p>
                        ))
                    ) : (
                        <>
                            <p>✅ Đã mở khóa tất cả công thức</p>
                            <p>✅ Trải nghiệm tính năng VIP</p>
                        </>
                    )}
                </div>

                <button 
                    onClick={() => navigate('/')} 
                    className="premium-btn"
                >
                    Bắt đầu trải nghiệm ngay
                </button>
            </div>
        </div>
    );
};

export default PremiumSuccess;