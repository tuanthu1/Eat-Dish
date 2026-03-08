import React from 'react';
import '../index.css';

const getFullImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/300x200?text=No+Image'
    if (url.startsWith('http')) return url; 
    
    if (url.startsWith('undefined/')) {
        return `https://eatdish.net/${url.replace('undefined/', '')}`;
    }
    
    if (url.startsWith('/')) {
        return `https://eatdish.net${url}`;
    }
    
    return `https://eatdish.net/${url}`;
};

const RecipeCard = ({ item, isFavorite, onToggleFavorite, onOpenModal, onViewProfile }) => {
    const displayTitle = item.name || item.title || 'Món ăn ngon';
    const displayImg = getFullImageUrl(item.img || item.image || item.image_url);
    const displayAuthorName = item.fullname || item.author_name || item.username || 'Đầu bếp EatDish';
    
    let displayAvatar = item.avatar || item.author_avatar;
    if (displayAvatar) {
        displayAvatar = getFullImageUrl(displayAvatar);
    } else {
        displayAvatar = `https://ui-avatars.com/api/?name=${displayAuthorName}&background=random`;
    }
    

    return (
        <div className="recipe-card-wrapper">
            <div className="recipe-card-fav-btn" onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.id, e); }}>
                {isFavorite ? '❤️' : '🤍'}
            </div>

            <div className="recipe-card-img-wrapper" onClick={() => onOpenModal(item)}>
                <img src={displayImg} alt={displayTitle} className="recipe-card-img" />
                {(item.is_premium === 1 || item.is_vip === 1) && <div className="recipe-card-premium-badge">👑 PREMIUM</div>}
            </div>

            <div className="recipe-card-body">
                <div>
                    <div className="recipe-card-meta">
                        <div className="meta-item"><span>🔥</span> <span className="highlight-calo">{item.calories || 0} calo</span></div>
                        <div className="meta-item"><span>⏳</span> {item.time || 0} phút</div>
                    </div>
                    <h3 onClick={() => onOpenModal(item)} className="recipe-card-title">{displayTitle}</h3>
                </div>

                <div className="recipe-card-author-row" onClick={(e) => { e.stopPropagation(); onViewProfile(item.user_id || item.author_id); }}>
                    <img src={displayAvatar} alt="author" className="recipe-card-author-avt" />
                    <span className="author-name-text">
                        Đăng bởi <span className="bold-name">{displayAuthorName}</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default RecipeCard;