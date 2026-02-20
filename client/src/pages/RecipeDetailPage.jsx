import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import RecipeReviews from '../components/RecipeReviews';
import PremiumModal from '../components/modals/PremiumModal';
import '../index.css';

const RecipeDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [isFavorited, setIsFavorited] = useState(false);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

    const userStr = localStorage.getItem('user') || localStorage.getItem('eatdish_user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const myId = localStorage.getItem('eatdish_user_id');
    
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const reviewsRef = useRef(null);

    const isAdmin = currentUser?.role === 'admin' || localStorage.getItem('eatdish_user_role') === 'admin';
    const isRecipeVip = (recipe?.is_premium == 1 || recipe?.is_vip == 1);
    const isLocked = isRecipeVip && (!currentUser || currentUser.is_premium != 1) && !isAdmin;

    useEffect(() => {
        setError('');
        setSuccessMsg('');
        setIsLoading(true);

        const fetchRecipe = async () => {
            try {
                const res = await axiosClient.get(`/recipes/${id}`); 
                setRecipe(res.data);

                if(myId) {
                    const resFavorite = await axiosClient.get(`/recipes/favorites/${myId}`);
                    const listFavorite = resFavorite.data.map(f => f.id);
                    if(listFavorite.includes(parseInt(id))) setIsFavorited(true);
                }
            } catch (err) {
                console.log("Lỗi tải trang chi tiết:", err);
                setError("Không thể tải thông tin món ăn.");
            } finally {
                setIsLoading(false);
            }
        };

        if (!myId) {
            setError("Bạn cần đăng nhập để xem công thức này!");
            setIsLoading(false);
            navigate('/login');
            return;
        }
        fetchRecipe();
    }, [id, myId, navigate]);

    const handleToggleFavorite = async () => {
        if(!myId) return setError("Bạn cần đăng nhập để thực hiện chức năng này!");
        try {
            await axiosClient.post('/recipes/favorites/toggle', { userId: myId, recipeId: id });
            setIsFavorited(!isFavorited);
            setSuccessMsg(isFavorited ? "Đã bỏ lưu món ăn" : "Đã lưu vào yêu thích");
        } catch(e) { setError("Lỗi kết nối."); }
    };

    const handleCookDone = async () => {
        if (!myId) return setError("Bạn cần đăng nhập để lưu lịch sử!");
        try {
            await axiosClient.post('/recipes/cooked', { userId: myId, recipeId: id });            
            let countdown = 4;
            const countdownInterval = setInterval(() => {
                countdown--;
                if (countdown > 0) {
                    reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
                    setSuccessMsg(`Chúc mừng bạn đã hoàn thành món ăn! ❤️`);
                } else {
                    clearInterval(countdownInterval);
                    navigate('/');
                }
            }, 1000);
        } catch (err) { setError("Không thể lưu lịch sử nấu nướng."); }
    };

    const safeParse = (data) => {
        try {
            if (Array.isArray(data)) return data;
            if (typeof data === 'string') return JSON.parse(data);
            return [];
        } catch (e) { return []; }
    };

    if (isLoading) return <div className="page-loading-msg">Đang tìm công thức ngon... 🍜</div>;
    if (!recipe) return <div className="page-loading-msg">Không tìm thấy món ăn này 😔</div>;

    return (
        <div className="recipe-detail-wrapper">
            {(error || successMsg) && (
                <div className={`recipe-toast-custom ${error ? 'error' : 'success'}`}>
                    <span>{error ? '⚠️' : '✅'}</span> {error || successMsg}
                </div>
            )}

            <div className="recipe-detail-header">
                <button className="btn-back-header" onClick={() => navigate(-1)}>
                    ← Quay lại
                </button>
                <h2 className="recipe-header-title">{recipe.title || recipe.name}</h2>
                <div style={{ width: '80px' }}></div> 
            </div>

            <div className="recipe-content-wrapper">
                
                {/* CỘT TRÁI */}
                <div className="recipe-col-left">
                    <div className="recipe-media-container">
                        {isLocked ? (
                            <>
                                <img 
                                    src={recipe.img || recipe.image || recipe.image_url} 
                                    alt={recipe.name}
                                    className="recipe-media-img locked"
                                />
                                <div className="recipe-locked-text">
                                    <div className="icon">🔒</div>
                                    <h3>Video Premium</h3>
                                    <p>Nâng cấp VIP để xem hướng dẫn</p>
                                </div>
                            </>
                        ) : (
                            (recipe.video_url || recipe.youtube_link) ? (
                                <iframe 
                                    className="recipe-media-iframe"
                                    src={(() => {
                                        const url = recipe.video_url || recipe.youtube_link;
                                        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                                        const match = url.match(regExp);
                                        return (match && match[2].length === 11) 
                                            ? `https://www.youtube.com/embed/${match[2]}?autoplay=0` 
                                            : url;
                                    })()}
                                    title="Recipe Video" 
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <img 
                                    src={recipe.img || recipe.image || recipe.image_url} 
                                    alt={recipe.name}
                                    className="recipe-media-img"
                                />
                            )
                        )}
                        {isRecipeVip && <div className="recipe-premium-badge">👑 PREMIUM</div>}
                    </div>
                </div>

                {/* CỘT PHẢI */}
                <div className="recipe-col-right">
                    
                    {/* LỚP PHỦ KHÓA */}
                    {isLocked && (
                        <div className="recipe-locked-overlay">
                            <div className="icon">🔒</div>
                            <h2>Công thức dành cho VIP</h2>
                            <p>Nâng cấp tài khoản để xem chi tiết nguyên liệu và cách làm.</p>
                            
                            <button className="btn-unlock-premium" onClick={() => setIsPremiumModalOpen(true)}>
                                👑 Mở khóa ngay
                            </button>
                        </div>
                    )}

                    {/* NỘI DUNG CHÍNH */}
                    <div className={`recipe-content-main ${isLocked ? 'locked' : ''}`}>
                        
                        <div className="recipe-author-box" onClick={(e) => {
                            e.stopPropagation();
                            navigate('/', { state: { viewProfileId: recipe.author_id || recipe.user_id } }); 
                        }}>
                            <img src={recipe.author_avatar || `https://ui-avatars.com/api/?name=${recipe.author_name || 'User'}`} alt="" />
                            <div className="author-info">
                                <span className="label">Công thức bởi</span>
                                <span className="name">{recipe.author_name || recipe.fullname}</span>
                            </div>
                        </div>

                        {/* Nguyên liệu */}
                        <div className="recipe-section">
                            <h3 className="section-title orange">🛒 Nguyên liệu</h3>
                            {!isLocked ? (
                                <ul className="recipe-ingredients-list">
                                    {safeParse(recipe.ingredients).map((ing, i) => <li key={i}>{ing}</li>)}
                                </ul>
                            ) : <p className="locked-msg">🔒 Nội dung đã bị ẩn.</p>}
                        </div>

                        {/* Cách làm */}
                        <div className="recipe-section">
                            <h3 className="section-title dark">👨‍🍳 Cách làm</h3>
                            {!isLocked ? (
                                <div>
                                    {safeParse(recipe.steps || recipe.instructions).map((step, i) => (
                                        <div key={i} className="recipe-step-item">
                                            <div className="step-number">{i + 1}</div>
                                            <div className="step-text">{step}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="locked-msg">🔒 Nội dung đã bị ẩn.</p>}
                        </div>

                         <div className="recipe-action-buttons">
                            <button 
                                onClick={handleCookDone} 
                                disabled={isLocked} 
                                className="btn-cook-done"
                            >
                                ✅ Đã nấu xong!
                            </button>
                            <button 
                                onClick={handleToggleFavorite} 
                                className={`btn-favorite-recipe ${isFavorited ? 'active' : ''}`}
                            >
                                {isFavorited ? '❤️' : '🤍'}         
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <PremiumModal 
                isOpen={isPremiumModalOpen} 
                onClose={() => setIsPremiumModalOpen(false)}
                user={currentUser || {}} 
                onUpgradeSuccess={() => window.location.reload()} 
            />

            <div ref={reviewsRef} className="recipe-reviews-wrapper">
                <RecipeReviews recipeId={id} />
            </div>
        </div>
    );
};

export default RecipeDetailPage;