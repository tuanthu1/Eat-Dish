import React, { useState, useEffect } from 'react';
import Modal from '../Modal';

const AdminBenefitModal = ({ isOpen, onClose, onSubmit, initialData, isEditMode }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_active: true
    });

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && initialData) {
                setFormData({
                    name: initialData.name || '',
                    description: initialData.description || '',
                    is_active: initialData.is_active ?? true
                });
            } else {
                setFormData({
                    name: '',
                    description: '',
                    is_active: true
                });
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
        if (!formData.name.trim()) {
            alert('Tên quyền lợi là bắt buộc!');
            return;
        }
        onSubmit?.(formData);
    };

    if (!isOpen) return null;

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
            title={isEditMode ? "Chỉnh sửa quyền lợi" : "Thêm quyền lợi mới"}
        >
            <form onSubmit={handleSubmit}>
                <div>
                    <label style={{ fontWeight: 'bold', color: '#555' }}>
                        Tên quyền lợi
                        <span style={{ color: '#999', fontSize: '0.9em' }}> (ID sẽ tự động tạo)</span>
                    </label>
                    <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange}
                        placeholder="VD: Truy cập công thức VIP"
                        style={inputStyle}
                        required 
                    />
                </div>

                <div>
                    <label style={{ fontWeight: 'bold', color: '#555' }}>Mô tả chi tiết</label>
                    <textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange}
                        placeholder="Mô tả chi tiết về quyền lợi này..."
                        rows="3"
                        style={{ ...inputStyle, resize: 'vertical' }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <input 
                        type="checkbox" 
                        name="is_active" 
                        id="is_active"
                        checked={formData.is_active} 
                        onChange={handleChange} 
                        style={{ width: '18px', height: '18px', marginRight: '8px', accentColor: '#ff9f1c' }}
                    />
                    <label htmlFor="is_active" style={{ cursor: 'pointer', color: '#333' }}>
                        Bật quyền lợi này (nếu tắt, user không thể sử dụng ngay cả khi có gói)
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
                        {isEditMode ? "Cập nhật" : "Thêm mới"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AdminBenefitModal;
