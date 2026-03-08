import React, { useState } from 'react';
import Modal from '../Modal'; 
import PremiumModal from './PremiumModal'; 

const LockedModal = ({ isOpen, onClose, recipe, setIsUploadModalOpen }) => {
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

    if (!recipe) return null;

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Nội dung giới hạn">
                <div className="locked-modal-box">
                    <div className="locked-img-wrapper">
                        <img src={recipe.img || recipe.image || recipe.image_url} className="locked-img" alt="locked" />
                        <div className="locked-icon-large">🔒</div>
                    </div>

                    <h2 className="locked-title">{recipe.name || recipe.title}</h2>
                    <p className="locked-desc">
                        Đây là công thức <b>Premium</b> dành riêng cho hội viên VIP.<br/>
                        Vui lòng nâng cấp tài khoản để xem chi tiết nguyên liệu và cách làm.
                    </p>

                    <button className="btn-locked-unlock" onClick={() => { setIsPremiumModalOpen(true); setIsUploadModalOpen(false); }}>
                        👑 Mở khóa ngay
                    </button>

                    <button className="btn-locked-cancel" onClick={onClose}>Để sau</button>
                </div>
            </Modal>
            <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} user={{}} onUpgradeSuccess={() => window.location.reload()} />
        </>
    );
};
export default LockedModal;