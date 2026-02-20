import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import '../../index.css';

const PremiumView = ({ user }) => {
    // --- STATE LOGIC ---
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');
    
    const [packages, setPackages] = useState([]);
    const [selectedPkg, setSelectedPkg] = useState(null);
    
    const [couponCode, setCouponCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [couponMsg, setCouponMsg] = useState('');

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const res = await axiosClient.get('/packages');
                if (res.data && res.data.length > 0) {
                    const activePackages = res.data.filter(p => p.is_active == 1);
                    setPackages(activePackages);
                    if (activePackages.length > 0) {
                        setSelectedPkg(activePackages[0]);
                    }
                }
            } catch (err) { 
                setError('Không thể tải danh sách gói Premium lúc này.');
            } finally {
                setIsFetching(false);
            }
        };
        fetchPackages();
    }, []);

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ';

    const safeParseBenefits = (benefits) => {
        try {
            if (!benefits) return [];
            return typeof benefits === 'string' ? JSON.parse(benefits) : benefits;
        } catch (e) { return []; }
    };

    const handleSelectPackage = (pkg) => {
        setSelectedPkg(pkg);
        setAppliedDiscount(null);
        setCouponMsg('');
        setCouponCode('');
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponMsg('');
        setAppliedDiscount(null);
        try {
            const res = await axiosClient.post('/payment/check-coupon', { code: couponCode });
            setAppliedDiscount({ percent: res.data.percent, code: res.data.code });
            setCouponMsg(`✅ ${res.data.message}`);
        } catch (err) {
            setCouponMsg('❌ Mã giảm giá không hợp lệ hoặc đã hết hạn');
        }
    };

    const handlePayOS = async () => {
        if (!selectedPkg) return;
        setError('');
        try {
            setIsLoading(true);
            const res = await axiosClient.post("/payment/create", { 
                packageId: selectedPkg.id, discountCode: appliedDiscount ? appliedDiscount.code : null
            });
            window.location.href = res.data.checkoutUrl;
        } catch (err) {
            setError("Không thể khởi tạo thanh toán. Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    };

    const originalPrice = selectedPkg ? selectedPkg.price : 0;
    const finalPrice = appliedDiscount ? originalPrice - (originalPrice * appliedDiscount.percent / 100) : originalPrice;

    if (isFetching) return <div className="page-loading-msg">Đang tải dữ liệu các gói... ⏳</div>;
    if (packages.length === 0) return <div className="page-loading-msg">Hiện chưa có gói Premium nào đang mở bán.</div>;

    return (
        <div id="view-premium" className="fadeIn premium-view-container">
            
            <div className="banner recipes-banner">
                <div className="banner-text">
                    <h1 style={{color: '#fff'}}>Nâng cấp Premium 👑</h1>
                    <p style={{color: '#fff'}}>Trở thành Đầu Bếp VIP để mở khóa toàn bộ công thức và tính năng độc quyền.</p>
                </div>
            </div>

            {/* SPLIT LAYOUT CONTAINER */}
            <div className="premium-split-container">
                
                {/* BÊN TRÁI: SHOWCASE ĐẶC QUYỀN */}
                <div className="premium-left-pane">
                    {selectedPkg && (
                        <div className="fadeIn" key={selectedPkg.id}>
                            <h2 className="premium-left-title">
                                Quyền lợi <span>{selectedPkg.name}</span>
                            </h2>
                            <p className="premium-left-desc">
                                {selectedPkg.description || 'Nâng cấp tài khoản để trải nghiệm các tính năng bếp núc đỉnh cao nhất.'}
                            </p>
                            
                            <div className="premium-benefit-list">
                                {safeParseBenefits(selectedPkg.benefits).length > 0 ? (
                                    safeParseBenefits(selectedPkg.benefits).map((benefit, i) => (
                                        <div key={i} className="premium-benefit-item">
                                            <div className="premium-benefit-icon">✅</div>
                                            <div className="premium-benefit-text">{benefit}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="premium-benefit-empty">Đang cập nhật quyền lợi...</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* BÊN PHẢI: CHECKOUT CARD */}
                <div className="premium-checkout-card">
                    <h3 className="premium-section-title">1. Chọn gói đăng ký</h3>
                    
                    <div className="premium-package-list">
                        {packages.map(pkg => {
                            const isSelected = selectedPkg?.id === pkg.id;
                            const isBestValue = pkg.duration_days >= 365;

                            return (
                                <div 
                                    key={pkg.id} 
                                    onClick={() => handleSelectPackage(pkg)}
                                    className={`premium-package-item ${isSelected ? 'active' : ''}`}
                                >
                                    {isSelected && <div className="premium-package-active-bar"></div>}
                                    
                                    <div>
                                        <div className="premium-pkg-name-wrapper">
                                            <span className="premium-pkg-name">{pkg.name}</span>
                                            {isBestValue && <span className="premium-pkg-badge">HOT</span>}
                                        </div>
                                        <div className="premium-pkg-duration">
                                            Sử dụng trong {pkg.duration_days > 3650 ? 'Trọn đời' : `${pkg.duration_days} ngày`}
                                        </div>
                                    </div>
                                    <div className="premium-pkg-price">
                                        {formatPrice(pkg.price)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <h3 className="premium-section-title">2. Mã ưu đãi</h3>
                    <div className="premium-coupon-wrapper">
                        <input 
                            type="text" 
                            placeholder="Nhập mã giảm giá..." 
                            value={couponCode}
                            onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponMsg(''); }}
                            className="premium-coupon-input"
                        />
                        <button onClick={handleApplyCoupon} className="premium-coupon-btn">Áp dụng</button>
                    </div>
                    {couponMsg && (
                        <p className={`premium-coupon-msg ${couponMsg.startsWith('✅') ? 'success' : 'error'}`}>
                            {couponMsg}
                        </p>
                    )}

                    <div className="premium-total-section">
                        <div className="premium-total-box">
                            <span className="premium-total-label">Tổng thanh toán</span>
                            <div className="premium-total-right">
                                {appliedDiscount && (
                                    <div className="premium-original-price">
                                        {formatPrice(originalPrice)}
                                    </div>
                                )}
                                <div className="premium-final-price">
                                    {formatPrice(finalPrice)}
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handlePayOS}
                            disabled={isLoading || !selectedPkg}
                            className="premium-pay-btn"
                        >
                            {isLoading ? "Đang kết nối..." : "Thanh Toán Ngay"}
                        </button>
                        {error && <p className="premium-error-text">{error}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PremiumView;