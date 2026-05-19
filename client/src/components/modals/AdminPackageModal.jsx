import React, { useState, useEffect } from 'react';
import Modal from '../Modal';

const AdminPackageModal = ({ isOpen, onClose, onSubmit, initialData, isEditMode, availableBenefits = [] }) => {
    // Khởi tạo state cho form
    const [formData, setFormData] = useState({
        name: '',
        duration_days: 30,
        price: 0,
        description: '',
        level: 1,
        benefit_ids: [],
        isActive: true
    });
    const [selectedBenefitId, setSelectedBenefitId] = useState('');

    // Nếu có dữ liệu truyền vào (chế độ Edit) thì điền sẵn vào form, không thì làm trống (chế độ Create)
    useEffect(() => {
        if (isOpen) {
            if (isEditMode && initialData) {
                const benefitIds = initialData.benefit_ids || initialData.benefits || [];
                // Ensure we extract IDs from benefit objects if they're full objects
                const extractedIds = Array.isArray(benefitIds) 
                    ? benefitIds.map(b => typeof b === 'string' ? b : (b?.id || b))
                    : [];
                setFormData({
                    name: initialData.name || '',
                    duration_days: initialData.duration_days ?? initialData.durationInMonths ?? 30,
                    price: initialData.price ?? 0,
                    description: initialData.description || '',
                    level: Number(initialData.level ?? initialData.package_level ?? 1),
                    benefit_ids: extractedIds,
                    isActive: initialData.is_active ?? initialData.isActive ?? true
                });
                setSelectedBenefitId('');
            } else {
                setFormData({
                    name: '',
                    duration_days: 30,
                    price: 0,
                    description: '',
                    level: 1,
                    benefit_ids: [],
                    isActive: true
                });
                setSelectedBenefitId('');
            }
        }
    }, [isOpen, initialData, isEditMode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit?.(formData);
    };

    const handleAddBenefit = () => {
        if (!selectedBenefitId || formData.benefit_ids.includes(selectedBenefitId)) {
            return;
        }

        setFormData(prev => ({
            ...prev,
            benefit_ids: [...prev.benefit_ids, selectedBenefitId]
        }));
        setSelectedBenefitId('');
    };

    const handleRemoveBenefit = (benefitIdToRemove) => {
        setFormData(prev => ({
            ...prev,
            benefit_ids: prev.benefit_ids.filter(id => id !== benefitIdToRemove)
        }));
    };

    const getBenefitName = (benefitId) => {
        // Handle case where benefitId might be a full object
        const actualId = typeof benefitId === 'string' ? benefitId : (benefitId?.id || benefitId);
        const benefit = availableBenefits.find(b => {
            const bId = typeof b === 'string' ? b : (b?.id || b);
            return bId === actualId;
        });
        // Always return a string, never an object
        if (typeof benefit === 'string') return benefit;
        if (benefit && typeof benefit === 'object') return benefit.name || actualId || '';
        return actualId || 'Quyền lợi';
    };

    if (!isOpen) return null;

    // Style chung cho input để tái sử dụng
    const inputStyle = {
        width: '100%',
        padding: '10px',
        marginTop: '5px',
        marginBottom: '15px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        boxSizing: 'border-box',
        fontFamily: 'inherit'
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={isEditMode ? "Chỉnh sửa gói Premium" : "Tạo gói Premium mới"}
        >
            <form onSubmit={handleSubmit}>
                <div>
                    <label style={{ fontWeight: 'bold', color: '#555' }}>Tên gói (VD: Premium 30 Ngày)</label>
                    <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        style={inputStyle}
                        required 
                    />
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontWeight: 'bold', color: '#555' }}>Thời hạn (Ngày)</label>
                        <input 
                            type="number" 
                            name="duration_days" 
                            value={formData.duration_days} 
                            onChange={handleChange} 
                            min="1"
                            style={inputStyle}
                            required 
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontWeight: 'bold', color: '#555' }}>Giá tiền (VNĐ)</label>
                        <input 
                            type="number" 
                            name="price" 
                            value={formData.price} 
                            onChange={handleChange} 
                            min="0"
                            style={inputStyle}
                            required 
                        />
                    </div>
                </div>

                <div>
                    <label style={{ fontWeight: 'bold', color: '#555' }}>Mô tả ngắn gọn</label>
                    <textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        rows="3"
                        style={{ ...inputStyle, resize: 'vertical' }}
                    />
                </div>

                <div>
                    <label style={{ fontWeight: 'bold', color: '#555' }}>Mức gói</label>
                    <select
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        style={inputStyle}
                    >
                        <option value={1}>1 - Cao nhất</option>
                        <option value={2}>2 - Trung bình</option>
                        <option value={3}>3 - Thấp hơn</option>
                    </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '8px' }}>
                        Quyền lợi ({formData.benefit_ids.length})
                    </label>

                    {availableBenefits.length === 0 && (
                        <div style={{ 
                            padding: '10px', 
                            background: '#fff3cd', 
                            border: '1px solid #ffc107', 
                            borderRadius: '5px', 
                            color: '#856404',
                            marginBottom: '10px'
                        }}>
                            ⚠️ Chưa có quyền lợi nào. Vui lòng tạo quyền lợi trước!
                        </div>
                    )}

                    {formData.benefit_ids.map((benefitId) => (
                        <div key={benefitId} style={{ borderBottom: '1px dashed #f5c572', paddingBottom: '6px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#f39c12', fontSize: '18px', lineHeight: 1 }}>✓</span>
                            <span style={{ flex: 1, color: '#333' }}>{getBenefitName(benefitId)}</span>
                            <span onClick={() => handleRemoveBenefit(benefitId)} style={{ color: '#e74c3c', cursor: 'pointer', fontWeight: 600 }}>(Xóa)</span>
                        </div>
                    ))}

                    {availableBenefits.length > 0 && (
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 auto', minWidth: '200px' }}>
                                <select
                                    value={selectedBenefitId}
                                    onChange={(e) => setSelectedBenefitId(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '10px',
                                        background: '#f7f8fb',
                                        fontFamily: 'inherit',
                                        cursor: 'pointer',
                                        minHeight: '44px',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="">-- Chọn quyền lợi --</option>
                                    {availableBenefits
                                        .filter(b => !formData.benefit_ids.includes(b.id))
                                        .map(benefit => (
                                            <option key={benefit.id} value={benefit.id}>
                                                {benefit.name} {!benefit.is_active && '(Tắt)'}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddBenefit}
                                disabled={!selectedBenefitId}
                                style={{
                                    width: '52px',
                                    height: '52px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: selectedBenefitId ? '#ff9f1c' : '#ccc',
                                    color: '#fff',
                                    fontSize: '28px',
                                    lineHeight: 1,
                                    cursor: selectedBenefitId ? 'pointer' : 'not-allowed',
                                    fontWeight: 700,
                                    flexShrink: 0
                                }}
                            >
                                +
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <input 
                        type="checkbox" 
                        name="isActive" 
                        id="isActive"
                        checked={formData.isActive} 
                        onChange={handleChange} 
                        style={{ width: '18px', height: '18px', marginRight: '8px', accentColor: '#ff9f1c' }}
                    />
                    <label htmlFor="isActive" style={{ cursor: 'pointer', color: '#333' }}>
                        Kích hoạt gói này ngay lập tức
                    </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button 
                        type="button" 
                        onClick={onClose}
                        style={{ padding: '10px 20px', borderRadius: '5px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        type="submit"
                        style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', background: '#ff9f1c', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {isEditMode ? "Cập nhật gói" : "Tạo mới"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AdminPackageModal;