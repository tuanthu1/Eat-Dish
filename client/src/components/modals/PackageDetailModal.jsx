import React from 'react';

const PackageDetailModal = ({ isOpen, onClose, pkg }) => {
    if (!isOpen || !pkg) return null;

    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    let benefitsList = [];
    try {
        if (typeof pkg.benefits === 'string') {
            if (pkg.benefits.trim().startsWith('[')) {
                benefitsList = JSON.parse(pkg.benefits); 
            } else {
                benefitsList = pkg.benefits.split('\n').filter(b => b.trim() !== '');
            }
        } else if (Array.isArray(pkg.benefits)) {
            benefitsList = pkg.benefits;
        }
    } catch (e) {
        benefitsList = [pkg.benefits];
    }

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div className="fadeIn" style={styles.content} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={styles.closeBtn}>×</button>
                
                <h2 style={styles.title}>Chi tiết gói cước</h2>
                
                <div style={styles.iconBox}>
                    {pkg.duration_days >= 365 ? '👑' : '💎'}
                </div>
                
                <h3 style={styles.pkgName}>{pkg.name}</h3>
                <div style={styles.price}>{formatCurrency(pkg.price)}</div>
                <div style={styles.duration}>Sử dụng trong: <b>{pkg.duration_days} ngày</b></div>
                
                <div style={styles.infoBox}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '15px' }}>
                        <b>Mô tả:</b> <br/> {pkg.description || "Chưa có mô tả."}
                    </p>
                    
                    {benefitsList && benefitsList.length > 0 && (
                        <div style={{ marginTop: '15px', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
                            <b style={{ fontSize: '15px', display: 'block', marginBottom: '10px' }}>Quyền lợi đặc biệt:</b>
                            <ul style={{ textAlign: 'left', paddingLeft: '0', margin: 0, listStyle: 'none', fontSize: '14.5px', color: '#444', lineHeight: '1.8' }}>
                                {benefitsList.map((item, index) => (
                                    <li key={index} style={{ marginBottom: '8px' }}>
                                        <span style={{ marginRight: '8px' }}>✅</span>{item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                
                <button onClick={onClose} style={styles.actionBtn}>
                    Đóng 
                </button>
            </div>
        </div>
    );
};

// CSS tĩnh
const styles = {
    overlay: { 
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        zIndex: 9999 
    },
    content: { 
        backgroundColor: '#fff', borderRadius: '20px', padding: '30px', 
        width: '90%', maxWidth: '420px', position: 'relative', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)', textAlign: 'center',
        maxHeight: '90vh', overflowY: 'auto' 
    },
    closeBtn: { position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#999', fontWeight: 'bold' },
    title: { fontSize: '22px', fontWeight: 'bold', marginBottom: '15px', color: '#333' },
    iconBox: { fontSize: '45px', marginBottom: '5px' },
    pkgName: { fontSize: '22px', color: '#555', marginBottom: '5px', fontWeight: 'bold' },
    price: { fontSize: '32px', color: '#ff9f1c', fontWeight: 'bold', marginBottom: '10px' },
    duration: { fontSize: '16px', color: '#666', marginBottom: '20px' },
    infoBox: { 
        textAlign: 'left', background: '#f8f9fa', padding: '20px', 
        borderRadius: '15px', color: '#555', border: '1px solid #eee', 
        marginBottom: '25px' 
    },
    actionBtn: { 
        width: '100%', padding: '14px', borderRadius: '12px', fontSize: '16px', 
        background: '#ff9f1c', color: '#fff', border: 'none', 
        cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' 
    }
};

export default PackageDetailModal;