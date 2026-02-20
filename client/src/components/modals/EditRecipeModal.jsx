import React, { useState, useEffect } from 'react';
import Modal from '../Modal'; 
import axiosClient from '../../api/axiosClient';
import ImageCropperModal from './ImageCropperModal';

const EditRecipeModal = ({ isOpen, onClose, user, editingRecipe, onUpdateSuccess }) => {
    const [editData, setEditData] = useState({ name: '', time: '', calories: '', description: '', video_url: '', ingredients: [], steps: [], image: null });
    const [editPreview, setEditPreview] = useState(null);
    const [tempIngredient, setTempIngredient] = useState('');
    const [tempStep, setTempStep] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [selectedFileToCrop, setSelectedFileToCrop] = useState(null);
    const [error, setError] = useState(''); // Thêm state error để thông báo

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
                image: null 
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

    const handleUpdateSubmit = async () => {
        if (!editData.name.trim()) { setError("Vui lòng nhập tên món ăn!"); return; }
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', editData.name);
            formData.append('time', editData.time);
            formData.append('calories', editData.calories);
            formData.append('description', editData.description);
            formData.append('video_url', editData.video_url);
            formData.append('ingredients', JSON.stringify(editData.ingredients));
            formData.append('steps', JSON.stringify(editData.steps));
            if (editData.image) formData.append('image', editData.image);

            const res = await axiosClient.post(`/recipes/${editingRecipe.id}?_method=PUT`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            onUpdateSuccess(res.data.recipe || res.data); 
            onClose();
        } catch (error) {
            setError("Lỗi khi cập nhật: " + (error.response?.data?.message || error.message));
        } finally { setIsLoading(false); }
    };

    if (!editingRecipe) return null;

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa công thức">
                <div className="edit-form-scroll">
                    
                    <div className="edit-recipe-header">
                        <img src={user?.avatar || 'https://via.placeholder.com/50'} alt="Avatar" className="edit-recipe-avt" />
                        <div>
                            <div className="edit-recipe-name">{user?.fullname || user?.username || 'Đầu bếp EatDish'}</div>
                            <div className="edit-recipe-status">Đang cập nhật công thức ✍️</div>
                        </div>
                    </div>

                    <div className="edit-recipe-img-box">
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

                    {error && <div className="admin-error-box">{error}</div>}

                    <textarea className="edit-input mb-15" placeholder="Tên món (VD: Phở Bò)" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} style={{minHeight: '40px'}} />
                    <div className="edit-recipe-grid">
                        <input className="edit-input mb-0" type="text" placeholder="Thời gian (VD: 30p)" value={editData.time} onChange={e => setEditData({...editData, time: e.target.value})} />
                        <input className="edit-input mb-0" type="number" placeholder="Calo (VD: 500)" value={editData.calories} onChange={e => setEditData({...editData, calories: e.target.value})} />
                    </div>
                    <input className="edit-input mb-15" type="text" placeholder="Video hướng dẫn (URL Youtube)" value={editData.video_url} onChange={e => setEditData({...editData, video_url: e.target.value})} />
                    <textarea className="edit-input mb-15" placeholder="Mô tả ngắn về món ăn..." value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} style={{ minHeight: '60px' }}></textarea>

                    <div className="up-section-box ing">
                        <label className="up-section-title orange">🛒 Nguyên liệu</label>
                        <ul className="up-list">
                            {editData.ingredients.map((ing, idx) => (
                                <li key={idx}>{ing} <span onClick={() => handleRemoveItem('ingredients', idx)} className="up-action-text">(Xóa)</span></li>
                            ))}
                        </ul>
                        <div className="up-add-row">
                            <input type="text" placeholder="Thêm nguyên liệu..." value={tempIngredient} onChange={e => setTempIngredient(e.target.value)} className="edit-input mb-0" onKeyPress={e => e.key === 'Enter' && handleAddIngredient()} />
                            <button onClick={handleAddIngredient} className="up-btn-add orange">+</button>
                        </div>
                    </div>

                    <div className="up-section-box step">
                        <label className="up-section-title dark">👩‍🍳 Các bước thực hiện</label>
                        <div>
                            {editData.steps.map((step, idx) => (
                                <div key={idx} className="up-step-item">
                                    <span className="up-step-prefix">B{idx + 1}:</span>
                                    <span style={{ flex: 1 }}>{step}</span>
                                    <span onClick={() => handleRemoveItem('steps', idx)} className="up-action-text" style={{marginLeft: 0}}>✕</span>
                                </div>
                            ))}
                        </div>
                        <div className="up-add-row">
                            <textarea placeholder="Thêm bước làm..." value={tempStep} onChange={e => setTempStep(e.target.value)} className="edit-input mb-0" style={{ minHeight: '50px' }}></textarea>
                            <button onClick={handleAddStep} className="up-btn-add dark">+</button>
                        </div>
                    </div>

                    <button onClick={handleUpdateSubmit} disabled={isLoading} className="btn-edit-recipe-submit">
                        {isLoading ? 'Đang cập nhật...' : 'Cập nhật công thức! 🚀'}
                    </button>
                </div>
            </Modal>
            <ImageCropperModal isOpen={cropModalOpen} onClose={() => { setCropModalOpen(false); setSelectedFileToCrop(null); }} imageFile={selectedFileToCrop} onCropComplete={handleCropConfirm} />
        </>
    );
};
export default EditRecipeModal;