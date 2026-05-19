import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import '../index.css';
import { Star, Trash2 } from 'lucide-react';

const RecipeReviews = ({ recipeId, refreshKey = 0 }) => {
    const [reviews, setReviews] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        // Lấy thông tin người dùng hiện tại từ localStorage
        const userStr = localStorage.getItem('user') || localStorage.getItem('eatdish_user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setCurrentUserId(user.id);
            } catch (e) {
                console.log('Lỗi parse user từ localStorage:', e);
            }
        }
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await axiosClient.get(`/recipes/${recipeId}/reviews`);
            setReviews(res.data);
        } catch (e) { console.log(e); }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
            return;
        }

        try {
            await axiosClient.delete(`/recipes/reviews/${reviewId}`);
            // Làm mới danh sách reviews
            fetchReviews();
        } catch (e) {
            console.error('Lỗi xóa đánh giá:', e);
            alert('Không thể xóa đánh giá. Vui lòng thử lại sau.');
        }
    };

    useEffect(() => {
        document.body.style.overflow = 'auto';
        document.body.style.height = 'auto';
        fetchReviews();
        return () => {
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';
        };
    }, [recipeId, refreshKey]);

    return (
        <div className="reviews-container">
            <h3>Đánh giá & Cooksnap từ cộng đồng <Star fill='#f1c40f' color='#f1c40f' /></h3>

            <div className="reviews-list">
                {reviews.length === 0 && (
                    <p className="review-empty-msg">Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ ảnh món bạn đã nấu.</p>
                )}

                {reviews.map(rev => (
                    <div key={rev.id || rev._id} className="review-item">
                        <div className="review-header">
                            <img src={rev.user?.avatar || rev.avatar} alt="avt" className="review-avatar" />
                            <b>{rev.user?.fullname || rev.user?.username || rev.username || 'Người dùng ẩn danh'}</b>
                            <span className="review-rating-stars">{[...Array(5)].map((_, i) => (
                                <Star key={i} size={16} fill={i < (rev.rating || 0) ? '#f1c40f' : 'none'} color={i < (rev.rating || 0) ? '#f1c40f' : '#ccc'} />
                            ))}</span>
                            <span className="review-rating-number">{Number(rev.rating || 0)}/5</span>
                            {currentUserId && rev.user && rev.user._id === currentUserId && (
                                <button 
                                    onClick={() => handleDeleteReview(rev._id)}
                                    className="review-delete-btn"
                                    title="Xóa đánh giá"
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#e74c3c',
                                        marginLeft: 'auto',
                                        padding: '4px 8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '14px'
                                    }}
                                >
                                    <Trash2 size={18} />
                                    Xóa
                                </button>
                            )}
                        </div>
                        {rev.cooksnap_image && (
                            <img src={rev.cooksnap_image} alt="cooksnap" className="review-cooksnap-image" />
                        )}
                        <p className="review-text">{rev.comment || 'Khong co nhan xet'}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default RecipeReviews;