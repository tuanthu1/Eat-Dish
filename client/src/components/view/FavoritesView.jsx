import React from 'react';
import RecipeCard from '../RecipeCard';
import anhbanner from '../../logo/monanfavoroite.png';
import '../../index.css'
const FavoritesView = ({ recipes, favorites, handleToggleFavorite, setSelectedRecipe, handleViewProfile }) => {
    const favoriteRecipes = recipes.filter(r => favorites.includes(r.id));

    return (
        <div id="view-favorites" className="fadeIn">
            <div className="banner" style={{ background: '#ff7675' }}>
                <div className="fav-banner">
                    <div className="banner-text">
                        <h1>Món yêu thích</h1>
                        <p>Bộ sưu tập các món ăn bạn đã lưu lại.</p>
                    </div>
                </div>
            <img src={anhbanner} className="banner-img" alt="fav-banner" />
            </div>
            <div className="section-header"><h2>Danh sách đã lưu ❤️</h2></div>
            <div className="favorite-recipes-section">
            <div className="product-grid">
                {favoriteRecipes.length > 0 ? (
                    favoriteRecipes.map(item => (
                        <RecipeCard 
                            key={item.id} 
                            item={item} 
                            isFavorite={true} 
                            onToggleFavorite={handleToggleFavorite} 
                            onOpenModal={setSelectedRecipe}
                            onViewProfile={handleViewProfile}
                        />
                    ))
                ) : (
                    <div className="empty-state-container">
                        <div className="empty-state-icon"><img src={anhbanner} className="banner-img" alt="fav-banner" /></div>
                        <p className="empty-state-text">Danh sách yêu thích đang trống</p>
                        <p className="empty-state-subtext">Hãy khám phá và lưu lại những món ăn ngon nhé!</p>
                    </div>
                )}
            </div>
        </div>
        </div>
    );
};

export default FavoritesView;