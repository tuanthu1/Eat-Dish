import React, { useState } from 'react';
import Modal from '../Modal';
import ImageCropperModal from './ImageCropperModal';

const UploadModal = ({
    isOpen,
    onClose,
    user,
    uploadData,
    setUploadData,
    uploadPreview,
    setUploadPreview,
    handleSubmitRecipe
}) => {

    const [tempIngredient, setTempIngredient] = useState('');
    const [tempStep, setTempStep] = useState('');
    
    // State cho modal cắt ảnh
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [selectedFileToCrop, setSelectedFileToCrop] = useState(null);

    const handleRecipeFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFileToCrop(file);
        setCropModalOpen(true);
    };

    const handleCropConfirm = (croppedFile) => {
        setUploadData(prev => ({ ...prev, image: croppedFile }));
        setUploadPreview(URL.createObjectURL(croppedFile));
        setCropModalOpen(false);
        setSelectedFileToCrop(null);
    };

    const handleAddIngredient = () => {
        if (!tempIngredient.trim()) return;
        setUploadData(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, tempIngredient.trim()]
        }));
        setTempIngredient('');
    };

    const handleAddStep = () => {
        if (!tempStep.trim()) return;
        setUploadData(prev => ({
            ...prev,
            steps: [...prev.steps, tempStep.trim()]
        }));
        setTempStep('');
    };

    const handleRemoveItem = (type, index) => {
        setUploadData(prev => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== index)
        }));
    };

    // [MỚI] Hàm xử lý cập nhật nội dung khi người dùng sửa trực tiếp
    const handleEditItem = (type, index, newValue) => {
        setUploadData(prev => {
            const updatedList = [...prev[type]];
            updatedList[index] = newValue; // Ghi đè giá trị mới vào vị trí index
            return { ...prev, [type]: updatedList };
        });
    };

    const handleAddVideoURL = (e) => {
        setUploadData(prev => ({
            ...prev,
            video_url: e.target.value
        }));
    }

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Chia sẻ công thức mới">
                <div className="up-modal-content">
                        {/* Hiển thị Avatar & Tên người đang đăng */}
                        <div className="up-author-box">
                            <img 
                                src={user.avatar || 'https://via.placeholder.com/50'} 
                                alt="My Avatar" 
                                className="up-author-avt"
                            />
                            <div>
                                <div className="up-author-name">
                                    {user.fullname || user.username || 'Đầu bếp EatDish'}
                                </div>
                                <div className="up-author-status">
                                    Đang sáng tạo công thức mới 🍳
                                </div>
                            </div>
                        </div>

                        {/* Ảnh món ăn */}
                        <div className="up-img-wrapper">
                            <label className="up-img-label">
                                {uploadPreview ? (
                                    <img src={uploadPreview} className="up-img-preview" alt="preview" />
                                ) : (
                                    <div className="up-img-placeholder">
                                        <span className="up-img-icon">📷</span>
                                        <span>Nhấn để chọn ảnh món ăn</span>
                                    </div>
                                )}
                                <input type="file" hidden accept="image/*" onChange={handleRecipeFileChange} />
                            </label>
                        </div>

                        {/* Thông tin chính */}
                        <textarea 
                            placeholder="Tên món (VD: Phở Bò)" 
                            value={uploadData.name} 
                            onChange={e => setUploadData({...uploadData, name: e.target.value})} 
                            className="up-input" 
                            style={{minHeight: '40px'}} 
                        />
                        
                        <div className="up-input-grid">
                            <input type="text" placeholder="Thời gian (VD: 30p)" value={uploadData.time} onChange={e => setUploadData({...uploadData, time: e.target.value})} className="up-input up-input-mb0" />
                            <input type="number" placeholder="Calo (VD: 500)" value={uploadData.calories} onChange={e => setUploadData({...uploadData, calories: e.target.value})} className="up-input up-input-mb0" />
                        </div>
                        
                        <input type="text" placeholder="Video hướng dẫn (URL Youtube)" value={uploadData.video_url} onChange={handleAddVideoURL} className="up-input" />
                        
                        <textarea 
                            placeholder="Mô tả ngắn về món ăn..." 
                            value={uploadData.description} 
                            onChange={e => setUploadData({...uploadData, description: e.target.value})} 
                            className="up-input" 
                            style={{ minHeight: '60px' }}
                        ></textarea>

                        {/* Nhập Nguyên liệu */}
                        <div className="up-section-box ing">
                            <label className="up-section-title orange">🛒 Nguyên liệu</label>
                            <ul className="up-list" style={{ listStyle: 'none', paddingLeft: 0 }}>
                                {uploadData.ingredients.map((ing, idx) => (
                                    <li key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ marginRight: '8px', color: '#ff9f1c' }}>•</span>
                                        {/* [MỚI] Cho phép sửa trực tiếp nguyên liệu */}
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
                                {uploadData.steps.map((step, idx) => (
                                    <div key={idx} className="up-step-item" style={{ alignItems: 'flex-start' }}>
                                        <span className="up-step-prefix" style={{ paddingTop: '8px' }}>B{idx + 1}:</span>
                                        {/* [MỚI] Cho phép sửa trực tiếp bước làm */}
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

                        <button onClick={handleSubmitRecipe} className="up-btn-submit">Đăng công thức ngay! 🚀</button>
                    </div>
            </Modal>

            <ImageCropperModal
                isOpen={cropModalOpen}
                onClose={() => {
                    setCropModalOpen(false);
                    setSelectedFileToCrop(null);
                }}
                imageFile={selectedFileToCrop}
                onCropComplete={handleCropConfirm}
            />
        </>
    );
};

export default UploadModal;