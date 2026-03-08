import React, { useState, useEffect } from 'react';
import Modal from '../Modal'; 
import axiosClient from '../../api/axiosClient';
import ImageCropperModal from './ImageCropperModal';
import { toast } from 'react-toastify';
const EditRecipeModal = ({ isOpen, onClose, user, editingRecipe, onUpdateSuccess }) => {
    const [editData, setEditData] = useState({ 
        name: '', time: '', calories: '', description: '', 
        video_url: '', ingredients: [], steps: [], image: null, is_premium: 0 
    });
    const [editPreview, setEditPreview] = useState(null);
    const [tempIngredient, setTempIngredient] = useState('');
    const [tempStep, setTempStep] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [selectedFileToCrop, setSelectedFileToCrop] = useState(null);

    const safeParse = (data) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        try { return JSON.parse(data); } catch (e) { return [data]; }
    };

    useEffect(() => {
        if (isOpen && editingRecipe) {
            setEditData({
                name: editingRecipe.title || editingRecipe.name || '',
                time: editingRecipe.time || editingRecipe.cook_time || '',
                calories: editingRecipe.calories || '',
                description: editingRecipe.description || '',
                video_url: editingRecipe.video_url || '',
                ingredients: safeParse(editingRecipe.ingredients),
                steps: safeParse(editingRecipe.steps || editingRecipe.instructions),
                image: null,
                is_premium: editingRecipe.is_premium || editingRecipe.is_vip ? 1 : 0
            });
            setEditPreview(editingRecipe.img || editingRecipe.image || editingRecipe.image_url || null);
            setTempIngredient(''); setTempStep('');
        }
    }, [isOpen, editingRecipe]);

    const handleRecipeFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFileToCrop(file);
        setCropModalOpen(true);
    };

    const handleCropConfirm = (croppedFile) => {
        setEditData(prev => ({ ...prev, image: croppedFile }));
        setEditPreview(URL.createObjectURL(croppedFile));
        setCropModalOpen(false); setSelectedFileToCrop(null);
    };

    const handleAddIngredient = () => {
        if (!tempIngredient.trim()) return;
        setEditData(prev => ({ ...prev, ingredients: [...prev.ingredients, tempIngredient.trim()] }));
        setTempIngredient('');
    };

    const handleAddStep = () => {
        if (!tempStep.trim()) return;
        setEditData(prev => ({ ...prev, steps: [...prev.steps, tempStep.trim()] }));
        setTempStep('');
    };

    const handleRemoveItem = (type, index) => {
        setEditData(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== index) }));
    };

    // Hàm xử lý cập nhật nội dung khi sửa trực tiếp
    const handleEditItem = (type, index, newValue) => {
        setEditData(prev => {
            const updatedList = [...prev[type]];
            updatedList[index] = newValue; 
            return { ...prev, [type]: updatedList };
        });
    };

    // Hàm xử lý gõ 
    const handleNumberInput = (field, value) => {
        const numberVal = value.replace(/[^0-9]/g, ''); 
        setEditData(prev => ({ ...prev, [field]: numberVal }));
    };

    // Xử lý phím Backspace
    const handleKeyDown = (e, field, suffix) => {
        if (e.key === 'Backspace') {
            const val = String(editData[field] || '');
            if (e.target.selectionStart !== e.target.selectionEnd) return;
            if (e.target.selectionStart === val.length && val.includes(suffix)) {
                e.preventDefault(); 
                const numberStr = val.replace(/[^0-9]/g, '');
                setEditData(prev => ({ ...prev, [field]: numberStr.slice(0, -1) }));
            }
        }
    };

    // Hiệu ứng Debounce: Chờ 1s sau khi ngừng gõ Thời gian
    useEffect(() => {
        const timeVal = editData.time;
        if (timeVal && !String(timeVal).includes('phút')) {
            const timer = setTimeout(() => {
                setEditData(prev => ({ ...prev, time: `${timeVal} phút` }));
            }, 1000);
            return () => clearTimeout(timer); 
        }
    }, [editData.time]);

    // Hiệu ứng Debounce: Chờ 1s sau khi ngừng gõ Calo
    useEffect(() => {
        const calVal = editData.calories;
        if (calVal && !String(calVal).includes('calo')) {
            const timer = setTimeout(() => {
                setEditData(prev => ({ ...prev, calories: `${calVal} calo` }));
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [editData.calories]);

    const handleUpdateSubmit = async () => {
        if (!editData.name.trim()) { toast.error("Vui lòng nhập tên món ăn!"); return; }
        setIsLoading(true);

        const parsedTime = editData.time ? parseInt(String(editData.time).replace(/[^0-9]/g, '')) || 0 : 0;
        const parsedCalories = editData.calories ? parseInt(String(editData.calories).replace(/[^0-9]/g, '')) || 0 : 0;

        try {
            const formData = new FormData();
            formData.append('name', editData.name);
            formData.append('time', parsedTime);
            formData.append('calories', parsedCalories);
            formData.append('description', editData.description);
            formData.append('video_url', editData.video_url);
            formData.append('ingredients', JSON.stringify(editData.ingredients));
            formData.append('steps', JSON.stringify(editData.steps));
            formData.append('is_premium', editData.is_premium ? 1 : 0);
            if (editData.image) formData.append('image', editData.image);

            const res = await axiosClient.post(`/recipes/${editingRecipe.id}?_method=PUT`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            onUpdateSuccess(res.data.recipe || res.data); 
            onClose();
        } catch (error) {
            toast.error("Lỗi khi cập nhật: " + (error.response?.data?.message || error.message));
        } finally { setIsLoading(false); }
    };

    if (!editingRecipe) return null;

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa công thức">
                <div className="up-modal-content">
                    
                    {/* Hiển thị Avatar & Tên */}
                    <div className="up-author-box">
                        <img 
                            src={user?.avatar || 'https://via.placeholder.com/50'} 
                            alt="My Avatar" 
                            className="up-author-avt"
                        />
                        <div>
                            <div className="up-author-name">
                                {user?.fullname || user?.username || 'Đầu bếp EatDish'}
                            </div>
                            <div className="up-author-status">
                                Đang cập nhật công thức ✍️
                            </div>
                        </div>
                    </div>

                    {/* Ảnh món ăn */}
                    <div className="up-img-wrapper">
                        <label className="up-img-label">
                            {editPreview ? (
                                <img src={editPreview} className="up-img-preview" alt="preview" />
                            ) : (
                                <div className="up-img-placeholder">
                                    <span className="up-img-icon">📷</span>
                                    <span>Nhấn để chọn ảnh món ăn mới</span>
                                </div>
                            )}
                            <input type="file" hidden accept="image/*" onChange={handleRecipeFileChange} />
                        </label>
                    </div>

                    {/* Thông tin chính */}
                    <textarea 
                        placeholder="Tên món (VD: Phở Bò)" 
                        value={editData.name} 
                        onChange={e => setEditData({...editData, name: e.target.value})} 
                        className="up-input" 
                        style={{minHeight: '40px'}} 
                    />
                    
                    <div className="up-input-grid">
                        <input 
                            type="text" 
                            placeholder="Thời gian (VD: 30)" 
                            value={editData.time} 
                            onChange={e => handleNumberInput('time', e.target.value)}
                            onKeyDown={e => handleKeyDown(e, 'time', 'phút')}
                            className="up-input up-input-mb0" 
                        />
                        <input 
                            type="text" 
                            placeholder="Calo (VD: 500)" 
                            value={editData.calories} 
                            onChange={e => handleNumberInput('calories', e.target.value)}
                            onKeyDown={e => handleKeyDown(e, 'calories', 'calo')}
                            className="up-input up-input-mb0" 
                        />
                    </div>
                    
                    <input type="text" placeholder="Video hướng dẫn (URL Youtube,TikTok)" value={editData.video_url} onChange={e => setEditData({...editData, video_url: e.target.value})} className="up-input" />
                    
                    <textarea 
                        placeholder="Mô tả ngắn về món ăn..." 
                        value={editData.description} 
                        onChange={e => setEditData({...editData, description: e.target.value})} 
                        className="up-input" 
                        style={{ minHeight: '60px' }}
                    ></textarea>

                    {/* Nhập Nguyên liệu */}
                    <div className="up-section-box ing">
                        <label className="up-section-title orange">🛒 Nguyên liệu</label>
                        <ul className="up-list" style={{ listStyle: 'none', paddingLeft: 0 }}>
                            {editData.ingredients.map((ing, idx) => (
                                <li key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ marginRight: '8px', color: '#ff9f1c' }}>•</span>
                                    <input 
                                        type="text" 
                                        value={ing}
                                        onChange={(e) => handleEditItem('ingredients', idx, e.target.value)}
                                        style={{ 
                                            flex: 1, border: 'none', borderBottom: '1px dashed #ffeaa7', 
                                            background: 'transparent', outline: 'none', fontSize: '14px', 
                                            padding: '2px 5px', color: '#2d3436' 
                                        }}
                                    />
                                    <span onClick={() => handleRemoveItem('ingredients', idx)} className="up-action-text">(Xóa)</span>
                                </li>
                            ))}
                        </ul>
                        <div className="up-add-row">
                            <input type="text" placeholder="VD: 500g Thịt bò..." value={tempIngredient} onChange={e => setTempIngredient(e.target.value)} className="up-input up-input-mb0" onKeyPress={e => e.key === 'Enter' && handleAddIngredient()} />
                            <button onClick={handleAddIngredient} className="up-btn-add orange">+</button>
                        </div>
                    </div>

                    {/* Nhập Bước làm */}
                    <div className="up-section-box step">
                        <label className="up-section-title dark">👩‍🍳 Các bước thực hiện</label>
                        <div>
                            {editData.steps.map((step, idx) => (
                                <div key={idx} className="up-step-item" style={{ alignItems: 'flex-start' }}>
                                    <span className="up-step-prefix" style={{ paddingTop: '8px' }}>B{idx + 1}:</span>
                                    <textarea 
                                        value={step}
                                        onChange={(e) => handleEditItem('steps', idx, e.target.value)}
                                        style={{ 
                                            flex: 1, border: '1px dashed #dcdde1', borderRadius: '8px', 
                                            background: '#fff', outline: 'none', padding: '8px', 
                                            fontSize: '14px', color: '#2d3436', minHeight: '45px', resize: 'vertical' 
                                        }}
                                    />
                                    <span onClick={() => handleRemoveItem('steps', idx)} className="up-action-text" style={{ marginLeft: '10px', paddingTop: '8px' }}>✕</span>
                                </div>
                            ))}
                        </div>
                        <div className="up-add-row">
                            <textarea placeholder="VD: Đun sôi nước..." value={tempStep} onChange={e => setTempStep(e.target.value)} className="up-input up-input-mb0" style={{ minHeight: '50px' }}></textarea>
                            <button onClick={handleAddStep} className="up-btn-add dark">+</button>
                        </div>
                    </div>

                    {user?.is_premium === 1 && (
                        <div style={{ 
                            margin: '15px 0', 
                            padding: '10px', 
                            background: 'linear-gradient(45deg, #fff3cd, #ffeaa7)', 
                            borderRadius: '8px',
                            border: '1px dashed #ff9f1c'
                        }}>
                            <label style={{ cursor: 'pointer', fontWeight: 'bold', color: '#d35400', display: 'flex', alignItems: 'center' }}>
                                <input 
                                    type="checkbox" 
                                    checked={editData.is_premium === 1}
                                    onChange={(e) => setEditData({...editData, is_premium: e.target.checked ? 1 : 0})}
                                    style={{ marginRight: '10px', transform: 'scale(1.3)' }}
                                />
                                👑 Đăng làm công thức Premium (Không hiện quảng cáo)
                            </label>
                        </div>
                    )}

                    <button onClick={handleUpdateSubmit} disabled={isLoading} className="up-btn-submit">
                        {isLoading ? 'Đang cập nhật...' : 'Cập nhật công thức! 🚀'}
                    </button>
                </div>
            </Modal>
            
            <ImageCropperModal 
                isOpen={cropModalOpen} 
                onClose={() => { setCropModalOpen(false); setSelectedFileToCrop(null); }} 
                imageFile={selectedFileToCrop} 
                onCropComplete={handleCropConfirm} 
            />
        </>
    );
};
export default EditRecipeModal;