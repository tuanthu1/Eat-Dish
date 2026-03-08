import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient'; 
import { toast } from 'react-toastify';
const PremiumModal = ({ isOpen, onClose }) => {
    // State
    const [isLoading, setIsLoading] = useState(false);
    
    const [packages, setPackages] = useState([]); 
    const [selectedPkg, setSelectedPkg] = useState(null); 
    
    const [couponCode, setCouponCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null); 
    const [couponMsg, setCouponMsg] = useState(''); 

    const [premiumInfo, setPremiumInfo] = useState({
        isPremium: false,
        expireDate: null
    });

    const formatExpiryDate = (dateString) => {
        if (!dateString) return 'Vĩnh viễn (Trọn đời)';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Load danh sách gói cước và trạng thái VIP
    useEffect(() => {
        const fetchData = async () => {
            try {
                const resPkgs = await axiosClient.get('/packages');
                if (resPkgs.data && resPkgs.data.length > 0) {
                    const activePackages = resPkgs.data.filter(p => p.is_active == 1);
                    setPackages(activePackages);
                    setSelectedPkg(activePackages[0]);
                }

                const resStatus = await axiosClient.get(`/status?t=${Date.now()}`);
                setPremiumInfo({
                    isPremium: resStatus.data.is_premium == 1,
                    expireDate: resStatus.data.premium_until
                });
            } catch (err) { console.error(err); }
        };
        if (isOpen) fetchData();
    }, [isOpen]);

    if (!isOpen) return null;

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
            setCouponMsg('❌ Mã giảm giá không hợp lệ');
        }
    };

    const handlePayOS = async () => {
        try {
            setIsLoading(true);
            const res = await axiosClient.post("/payment/create", { 
                packageId: selectedPkg?.id,
                discountCode: appliedDiscount ? appliedDiscount.code : null
            });
            window.location.href = res.data.checkoutUrl;
        } catch (err) {
            toast.error("Không thể khởi tạo thanh toán");
        } finally {
            setIsLoading(false);
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    const originalPrice = selectedPkg ? selectedPkg.price : 0;
    const finalPrice = appliedDiscount 
        ? originalPrice - (originalPrice * appliedDiscount.percent / 100) 
        : originalPrice;

    return (
        <div className="modal-overlay" style={overlayStyle}>
            <div className="modal-content" style={modalStyle}>
                <button onClick={onClose} style={closeBtnStyle}>✕</button>

                <div className="animate-fade-in">
                    <div style={{ fontSize: 40, marginBottom: 5 }}>👑</div>
                    <h2 style={{ color: '#ff9f1c', margin: '0 0 5px 0' }}>NÂNG CẤP PREMIUM</h2>
                    
                    {premiumInfo.isPremium && (
                        <div style={vipStatusBadgeStyle}>
                            ⭐ Bạn đang là VIP. Hạn dùng: <strong>{formatExpiryDate(premiumInfo.expireDate)}</strong>
                            <br/><small>(Mua thêm sẽ được cộng dồn thời hạn cũ)</small>
                        </div>
                    )}

                    <p style={{fontSize: '13px', color: '#636e72', marginBottom: '15px'}}>
                        {premiumInfo.isPremium ? 'Chọn gói để gia hạn thêm thời gian sử dụng:' : 'Chọn gói đăng ký phù hợp với bạn:'}
                    </p>

                    {/* DANH SÁCH GÓI CƯỚC  */}
                    <div style={packageListStyle}>
                        {packages.map(pkg => (
                            <div 
                                key={pkg.id}
                                onClick={() => handleSelectPackage(pkg)}
                                style={{
                                    ...packageCardStyle,
                                    border: selectedPkg?.id === pkg.id ? '2px solid #ff9f1c' : '2px solid #f1f2f6',
                                    background: selectedPkg?.id === pkg.id ? '#fffbf5' : '#fff'
                                }}
                            >
                                {pkg.duration_days >= 365 && (
                                    <span style={badgeBestValue}>Tiết kiệm</span>
                                )}

                                <h3 style={{fontSize: '13px', margin: '0 0 5px 0'}}>{pkg.name}</h3>
                                <div style={{fontSize: '15px', fontWeight: 'bold', color: '#ff9f1c'}}>
                                    {formatPrice(pkg.price)}
                                </div>
                                <small style={{color: '#a4b0be', fontSize: '11px'}}>
                                    {pkg.duration_days > 3650 ? 'Trọn đời' : `Dùng ${pkg.duration_days} ngày`}
                                </small>
                            </div>
                        ))}
                    </div>

                    {/* QUYỀN LỢI */}
                    {selectedPkg && (
                        <div style={benefitBoxStyle}>
                            <p style={{fontWeight: 'bold', marginBottom: 5, color: '#2d3436', fontSize: '13px'}}>
                                💎 Đặc quyền {selectedPkg.name}:
                            </p>
                            {selectedPkg.benefits ? (
                                (typeof selectedPkg.benefits === 'string' ? JSON.parse(selectedPkg.benefits) : selectedPkg.benefits).slice(0, 3).map((item, i) => (
                                    <div key={i} style={{marginBottom: 2, fontSize: '12px'}}>✅ {item}</div>
                                ))
                            ) : (
                                <p style={{fontSize: '12px'}}>Đang tải quyền lợi...</p>
                            )}
                        </div>
                    )}

                    {/* NHẬP MÃ GIẢM GIÁ */}
                    <div style={{ margin: '15px 0 10px 0', display: 'flex', gap: '8px' }}>
                        <input 
                            type="text" placeholder="Mã giảm giá" 
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            style={inputStyle}
                        />
                        <button onClick={handleApplyCoupon} style={applyBtnStyle}>Áp dụng</button>
                    </div>
                    {couponMsg && (
                        <p style={{ color: couponMsg.startsWith('✅') ? '#00b894' : '#ff7675', fontSize: '11px', margin: '0 0 10px 0', textAlign: 'left' }}>{couponMsg}</p>
                    )}

                    {/* TỔNG TIỀN & NÚT */}
                    <div style={totalSectionStyle}>
                        <div style={{textAlign: 'left'}}>
                            <span style={{fontSize: '12px', color: '#636e72'}}>Tổng cộng:</span><br/>
                            <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#ff7675' }}>
                                {formatPrice(finalPrice)}
                            </span>
                        </div>
                        
                        <button onClick={handlePayOS} style={btnPrimaryStyle} disabled={isLoading || !selectedPkg}>
                            {isLoading ? "Đang xử lý..." : (premiumInfo.isPremium ? "Gia hạn ngay" : "Thanh toán")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- STYLES BỔ SUNG ---
const vipStatusBadgeStyle = {
    background: '#fff9e6',
    border: '1px solid #ffe08a',
    borderRadius: '10px',
    padding: '10px',
    marginBottom: '15px',
    fontSize: '13px',
    color: '#856404'
};

const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: '15px', 
    overflowY: 'auto',        
    zIndex: 10000
};
const modalStyle = { background: '#fff', padding: '20px', borderRadius: '20px', width: '100%', maxWidth: '480px', textAlign: 'center', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', margin: 'auto', maxHeight: '90vh', overflowY: 'auto' };
const closeBtnStyle = { position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#b2bec3' };
const packageListStyle = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '15px' };
const packageCardStyle = { padding: '12px 5px', borderRadius: '15px', cursor: 'pointer', position: 'relative', transition: '0.2s' };
const badgeBestValue = { position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', background: '#ff7675', color: '#fff', fontSize: '9px', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' };
const benefitBoxStyle = { textAlign: 'left', background: '#f8f9fa', padding: '12px', borderRadius: '12px', border: '1px solid #e9ecef' };
const inputStyle = { flex: 1, padding: '8px 12px', borderRadius: '10px', border: '1px solid #dfe6e9', fontSize: '13px', outline: 'none' };
const applyBtnStyle = { padding: '8px 15px', borderRadius: '10px', border: 'none', background: '#2d3436', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '12px' };
const totalSectionStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', borderTop: '1px solid #f1f2f6', paddingTop: '15px' };
const btnPrimaryStyle = { padding: '10px 20px', background: 'linear-gradient(135deg, #ff9f1c, #e17055)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 5px 15px rgba(255, 159, 28, 0.3)' };

export default PremiumModal;