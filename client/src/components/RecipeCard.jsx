import React, { useState } from 'react';
import '../index.css';
import { Flame, Clock, Heart, MoreVertical, MessageSquareWarning } from 'lucide-react';
import PremiumIcon from './PremiumIcon';
import Modal from './Modal';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-toastify';

const DEFAULT_RECIPE_IMAGE = '/logo.png';

const getFullImageUrl = (url) => {
    if (!url) return DEFAULT_RECIPE_IMAGE;
    if (url.startsWith('http')) return url; 
    if (url.startsWith('undefined/')) return `https://eatdish.net/${url.replace('undefined/', '')}`;
    if (url.startsWith('/')) return `https://eatdish.net${url}`;
    return `https://eatdish.net/${url}`;
};

const formatClassification = (value, fallback) => {
    if (!value) return fallback;
    return String(value).replace(/_/g, ' ');
};

const getPremiumLevel = (recipe) => {
    const rawLevel = recipe?.premium_level ?? recipe?.is_premium ?? recipe?.is_vip ?? 0;
    if (rawLevel === true || rawLevel === 'true') return 1;
    const parsed = Number.parseInt(String(rawLevel), 10);
    return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
};

const RecipeCard = ({ item, isFavorite, onToggleFavorite, onOpenModal, onViewProfile }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [localPremiumLevel, setLocalPremiumLevel] = useState(() => getPremiumLevel(item));

    const displayTitle = item.name || item.title || 'Món ăn ngon';
    const displayImg = getFullImageUrl(item.img || item.image || item.image_url);
    const displayDescription = item.description || item.desc || '';
    const displayAuthorName = item.fullname || item.author_name || item.username || 'Đầu bếp EatDish';
    
    let displayAvatar = item.avatar || item.author_avatar;
    displayAvatar = displayAvatar ? getFullImageUrl(displayAvatar) : `https://ui-avatars.com/api/?name=${displayAuthorName}&background=random`;

    const targetId = item._id || item.id;
    // authorId already declared above as `const authorId = item.author?._id || item.user_id || item.author_id;`
    const categoryLabel = item.category_label || formatClassification(item.category, 'Khác');
    const mealTypeLabel = item.meal_type_label || formatClassification(item.meal_type, 'Không xác định');
    
    const currentUserStr = localStorage.getItem('user') || localStorage.getItem('eatdish_user_id');
    let currentUser = null;
    try { currentUser = currentUserStr ? JSON.parse(currentUserStr) : null; } catch(e) { currentUser = null; }

    const authorId = item.author?._id || item.user_id || item.author_id;

    const togglePremium = async (e) => {
        if (e) e.stopPropagation();
        if (!authorId) return toast.error('Không xác định tác giả');
        if (!currentUser || (String(currentUser.id) !== String(authorId) && currentUser.role !== 'admin')) {
            return toast.error('Chỉ tác giả hoặc admin mới có thể thay đổi trạng thái Premium');
        }
        const newVal = localPremiumLevel > 0 ? 0 : 1;
        try {
            await axiosClient.put(`/recipes/premium/${item._id || item.id}`, { is_premium: newVal });
            setLocalPremiumLevel(newVal);
            toast.success(newVal > 0 ? 'Đã đặt Premium cho công thức' : 'Đã gỡ Premium');
        } catch (err) {
            console.error('Lỗi toggle premium:', err);
            toast.error('Không thể thay đổi trạng thái Premium');
        }
    };

    return (
        <div className="recipe-card-wrapper">
            <div className="recipe-card-fav-btn" onClick={(e) => { e.stopPropagation(); onToggleFavorite(targetId, e); }}>
                <Heart 
                    size={20} 
                    color={isFavorite ? "#ff4757" : "#555"} 
                    fill={isFavorite ? "#ff4757" : "none"} 
                    style={{ transition: 'all 0.2s ease-in-out' }}
                />
            </div>

            <div className="recipe-card-main">
                <div className="recipe-card-body">
                    <div className="recipe-card-author-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onViewProfile(authorId); }}>
                            <img src={displayAvatar} alt="author" className={`recipe-card-author-avt ${item.author_is_premium ? 'premium-avatar' : ''}`} style={{ margin: 0 }} />
                            <span className={`author-name-text ${item.author_is_premium ? 'premium-text' : ''}`}>
                                {displayAuthorName}
                            </span>
                            {item.author_is_premium && <span title="Thành viên VIP" style={{ display: 'inline-flex', alignItems: 'center' }}><PremiumIcon size={16} /></span>}
                        </div>

                        {/* Dấu 3 chấm */}
                        <div style={{ position: 'relative' }} onMouseLeave={() => setIsMenuOpen(false)}>
                            <button 
                                className="recipe-card-menu-btn"
                                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
                            >
                                <MoreVertical size={18} />
                            </button>
                            {isMenuOpen && (
                                <div className="dropdown-menu-container" >
                                            {((currentUser && String(currentUser.id) === String(authorId)) || (currentUser && currentUser.role === 'admin')) && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); togglePremium(e); }}
                                                    className="dropdown-item"
                                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fffaf0'}
                                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    {localIsPremium ? 'Hủy Premium' : 'Đặt Premium'}
                                                </button>
                                            )}

                                            <button 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    setIsMenuOpen(false);
                                                    setIsReportModalOpen(true);
                                                }}
                                                className="dropdown-item report-btn"
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fff0f0'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <MessageSquareWarning size={16} /> Báo cáo món
                                            </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <h3 onClick={() => onOpenModal(item)} className="recipe-card-title">{displayTitle}</h3>

                    {displayDescription ? (
                        <p className="recipe-card-description" onClick={() => onOpenModal(item)}>
                            {displayDescription}
                        </p>
                    ) : null}

                    <div className="recipe-card-meta-row">
                        <div className="meta-item"><Clock size={15} /> <span>{item.time || 0} phút</span></div>
                        <div className="meta-item"><span><Flame fill='#ff9f1c' color='#ff9f1c'/></span> <span className="highlight-calo">{item.calories || 0} calo</span></div>
                    </div>

                    <div className="recipe-card-classify-row">
                        <span className="recipe-card-classify-pill">{categoryLabel}</span>
                        <span className="recipe-card-classify-pill muted">{mealTypeLabel}</span>
                    </div>
                </div>

                <div className="recipe-card-img-wrapper" onClick={() => onOpenModal(item)}>
                    <img
                        src={displayImg}
                        alt={displayTitle}
                        className="recipe-card-img"
                        onError={(e) => {
                            if (e.currentTarget.src.endsWith(DEFAULT_RECIPE_IMAGE)) return;
                            e.currentTarget.src = DEFAULT_RECIPE_IMAGE;
                        }}
                    />
                    {getPremiumLevel(item) > 0 && <div className="recipe-card-premium-badge">👑 PREMIUM {getPremiumLevel(item)}</div>}
                </div>
            </div>

            {/* Modal Báo cáo */}
            <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title="Báo cáo công thức">
                <div onClick={(e) => e.stopPropagation()}>
                    <p style={{ marginBottom: '15px', color: '#666' }}>Vui lòng cho biết lý do bạn báo cáo công thức <b>{displayTitle}</b>:</p>
                    <textarea
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        placeholder="Nhập lý do báo cáo..."
                        style={{ width: '100%', minHeight: '100px', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '15px' }}
                    />
                    <div className="modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button className="btn-confirm-no" onClick={() => setIsReportModalOpen(false)}>Hủy</button>
                        <button className="btn-confirm-yes"  onClick={async () => {
                            const userStr = localStorage.getItem('user') || localStorage.getItem('eatdish_user_id');
                            if (!userStr) return toast.error("Vui lòng đăng nhập để báo cáo!");
                            if (!reportReason.trim()) return toast.warning("Vui lòng nhập lý do báo cáo!");

                            try {
                                await axiosClient.post(`/recipes/report`, {
                                    reportedRecipeId: targetId,
                                    reason: reportReason
                                });
                                toast.success("Đã gửi báo cáo công thức thành công!");
                                setIsReportModalOpen(false);
                                setReportReason('');
                            } catch (err) {
                                toast.error(err.response?.data?.message || "Lỗi khi báo cáo công thức!");
                            }
                        }}>Gửi báo cáo</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default RecipeCard;