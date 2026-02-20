import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../Modal'; 
import PremiumModal from './PremiumModal'; 
import ConfirmModal from './ConfirmModal';
import axiosClient from '../../api/axiosClient';

const RecipeDetailModal = ({ isOpen, onClose, selectedRecipe }) => {
    const navigate = useNavigate();
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const buildCurrentUser = () => {
        const id = localStorage.getItem('eatdish_user_id');
        const role = localStorage.getItem('eatdish_user_role');
        const userStr = localStorage.getItem('eatdish_user');
        const parsedUser = userStr ? JSON.parse(userStr) : {};
        
        if(id && role) {
            return {
                id: Number(id),
                role: role,
                is_admin: role === 'admin',
                is_premium: parsedUser.is_premium || 0 
            }
        }
        return null;
    }

    const currentUser = buildCurrentUser();

    if (!selectedRecipe) { return null; }

    const isAdmin = currentUser?.is_admin === true;
    const canViewFullRecipe = isAdmin || currentUser?.is_premium === 1;
    const isLocked = (selectedRecipe.is_premium == 1 || selectedRecipe.is_vip == 1) && !canViewFullRecipe;
    
    // Check user hiện tại có phải chủ bài viết không
    const isOwner = currentUser && selectedRecipe && currentUser.id == selectedRecipe.author_id;

    if (!currentUser && isLocked) return null;

    // Hàm Xử Lý
    const safeParse = (data) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        try { return JSON.parse(data); } catch (e) { return [data]; }
    };

    // Mở modal xác nhận xóa
    const handleDeleteClick = () => {
        setIsDeleteConfirmOpen(true);
    };

    // Thực hiện xóa
    const executeDelete = async (e) => {
        if (e) e.preventDefault();
        setSuccessMsg('');
        try {
            await axiosClient.delete(`/recipes/${selectedRecipe.id}`);
            setIsDeleteConfirmOpen(false);
            setSuccessMsg("Xóa món thành công");
            onClose(); 
            window.location.reload(); 
        } catch (err) {
            alert(err.response?.data?.message || "Có lỗi xảy ra khi xóa!");
            setIsDeleteConfirmOpen(false);
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title={selectedRecipe.name || selectedRecipe.title}>
                <div className="rd-modal-content">
                    
                    {/* Lớp phủ khóa nếu chưa mua pre */}
                    {isLocked && (
                        <div className="rd-locked-overlay">
                            <div className="rd-locked-icon">🔒</div>
                            <h3 className="rd-locked-title">Nội dung Premium</h3>
                            <p className="rd-locked-desc">Nâng cấp tài khoản để xem công thức này.</p>
                            
                            <button className="rd-btn-unlock" onClick={() => setIsPremiumModalOpen(true)}>
                                👑 Mở khóa ngay
                            </button>
                        </div>
                    )}
                    
                    <div className={isLocked ? "rd-content-blur" : ""}>
                        
                        {/* Ảnh */}
                        <img 
                            src={selectedRecipe.img || selectedRecipe.image || selectedRecipe.image_url} 
                            className="rd-image" 
                            alt={selectedRecipe.name} 
                        />

                        {/* Nguyên liệu */}
                        <div className="rd-ing-box">
                            <h3 className="rd-ing-title">🛒 Nguyên liệu</h3>
                            
                            {!isLocked ? (
                                <ul className="rd-ing-list">
                                    {safeParse(selectedRecipe.ingredients).map((ing, i) => <li key={i}>{ing}</li>)}
                                </ul>
                            ) : (
                                <p className="rd-msg-hidden">Nội dung nguyên liệu đã bị ẩn do chưa mua premium 🔒</p>
                            )}
                        </div>

                        {/* Cách làm */}
                        <h3 className="rd-step-title">👨‍🍳 Cách làm</h3>
                        {!isLocked ? (
                            safeParse(selectedRecipe.steps || selectedRecipe.instructions).map((step, i) => (
                                <div key={i} className="rd-step-row">
                                    <div className="rd-step-num">{i + 1}</div>
                                    <div className="rd-step-text">{step}</div>
                                </div>
                            ))
                        ) : (
                            <p className="rd-msg-hidden">Hướng dẫn chi tiết chỉ dành cho thành viên VIP 🔒</p>
                        )}

                        <button className="rd-btn-view-full" onClick={() => { onClose(); navigate(`/recipe/${selectedRecipe.id}`); }}>
                            Xem chi tiết đầy đủ ➜
                        </button>
                        
                        {/* Nút Xóa */}
                        {isOwner && (
                            <button className="rd-btn-delete" onClick={handleDeleteClick}>
                                🗑️ Xóa
                            </button>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Modal Thanh Toán */}
            <PremiumModal 
                isOpen={isPremiumModalOpen} 
                onClose={() => setIsPremiumModalOpen(false)}
                user={currentUser || {}}
                onUpgradeSuccess={() => window.location.reload()} 
            />

            {/* Modal Xác nhận xóa */}
            <ConfirmModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)} 
                onConfirm={executeDelete}
                title={'Xóa công thức'}
                message={
                    <span>
                        Bạn có chắc chắn muốn xóa công thức <b>{selectedRecipe.title || selectedRecipe.name}</b> không? 
                        <br/><br/>
                        <small style={{color: 'red'}}>Hành động này không thể hoàn tác.</small>
                    </span>
                }
            />
        </>
    );
};

export default RecipeDetailModal;