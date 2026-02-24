import React, { useState, useEffect } from 'react';

const AdminCouponModal = ({ isOpen, onClose, onSubmit, initialData, isEditMode }) => {
    const [formData, setFormData] = useState({ code: '', percent: 10, expiry_date: '' });
    const [error, setError] = useState('');

    const today = new Date().toISOString().split('T')[0];
    useEffect(() => {
        if (isOpen) {
            if (isEditMode && initialData) {
                setFormData({
                    code: initialData.code || '',
                    percent: initialData.percent || 10,
                    expiry_date: initialData.expiry_date ? initialData.expiry_date.split('T')[0] : ''
                });
            } else {
                setFormData({ code: '', percent: 10, expiry_date: '' });
            }
            setError(''); 
        }
    }, [isOpen, initialData, isEditMode]);

    const generateRandomCode = () => {
        const randomStr = Math.random().toString(36).substring(3, 6).toUpperCase();
        const randomDays = Math.floor(Math.random() * (365 - 30 + 1)) + 30; 
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + randomDays);
        const dateStr = futureDate.toISOString().split('T')[0];
        const randomPercent = Math.floor(Math.random() * (5 - 1 + 1) + 1) * 10;
        setFormData({ code: `SALE${randomPercent}-${randomStr}`, percent: randomPercent, expiry_date: dateStr });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (formData.expiry_date && formData.expiry_date < today) return setError("❌ Ngày hết hạn không được nhỏ hơn ngày hiện tại!");
        if (formData.percent < 1 || formData.percent > 100) return setError("❌ Phần trăm giảm giá phải từ 1% đến 100%");
        if (!formData.code.trim()) { generateRandomCode(); return setError("⚠️ Vui lòng nhập mã hoặc bấm nút Random"); }
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="modal show">
            <div className="modal-content" style={{ width: 400 }}>
                <span className="close-btn" onClick={onClose}>&times;</span>
                <h2 className="modal-header-title">{isEditMode ? "Cập Nhật Mã Giảm Giá" : "Tạo Mã Giảm Giá"}</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Mã Code</label>
                        <div className="admin-flex-row">
                            <input 
                                className="admin-form-input admin-flex-1" 
                                value={formData.code} 
                                onChange={e => { setFormData({ ...formData, code: e.target.value.toUpperCase() }); setError(''); }} 
                                placeholder="VD: TET2024" disabled={isEditMode} 
                                style={{ background: isEditMode ? '#eee' : '#fff' }}
                            />
                            {!isEditMode && (
                                <button type="button" onClick={generateRandomCode} className="btn-random-code" title="Tạo ngẫu nhiên">🎲 Random</button>
                            )}
                        </div>
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-form-label">Giảm giá (%)</label>
                        <input className="admin-form-input" type="number" min="1" max="100" value={formData.percent} onChange={e => setFormData({ ...formData, percent: e.target.value })} required />
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-form-label">Hết hạn ngày</label>
                        <input className="admin-form-input" type="date" min={today} value={formData.expiry_date} onChange={e => { setFormData({ ...formData, expiry_date: e.target.value }); setError(''); }} required />
                    </div>

                    {error && <div className="admin-error-box">{error}</div>}

                    <button type="submit" className="btn-primary-admin w-100 justify-center">
                        {isEditMode ? "Lưu Thay Đổi" : "Tạo Mã Ngay"}
                    </button>
                </form>
            </div>
        </div>
    );
};
export default AdminCouponModal;