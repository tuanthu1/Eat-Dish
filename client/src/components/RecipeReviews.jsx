import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import '../index.css';
const RecipeReviews = ({ recipeId }) => {
    const myId = localStorage.getItem('eatdish_user_id');
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');

    const fetchReviews = async () => {
        try {
            const res = await axiosClient.get(`/recipes/${recipeId}/reviews`);
            setReviews(res.data);
        } catch (e) { console.log(e); }
    };

    useEffect(() => {
        document.body.style.overflow = 'auto';
        document.body.style.height = 'auto';
        fetchReviews(); 
        return () => {
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';
        };
    }, [recipeId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!myId) return setError("Cần đăng nhập!");
        try {
            await axiosClient.post('/recipes/reviews', { recipeId, userId: myId, rating, comment });
            setComment('');
            fetchReviews();
        } catch (e) { setError("Lỗi khi gửi"); }
    };

    return (
        <div className="reviews-container">
            <h3>Đánh giá từ cộng đồng ⭐</h3>
            <form onSubmit={handleSubmit} className="reviews-form">
                <div className="reviews-stars">
                    {[1, 2, 3, 4, 5].map(num => (
                        <span key={num} onClick={() => setRating(num)} className={`review-star ${num <= rating ? 'active' : ''}`}>★</span>
                    ))}
                </div>
                <textarea 
                    value={comment} onChange={(e) => setComment(e.target.value)}
                    placeholder="Bạn thấy món ăn này thế nào?" className="reviews-textarea"
                />
                <button type="submit" className="btn-submit-review">Gửi đánh giá</button>
            </form>

            <div className="reviews-list">
                {reviews.map(rev => (
                    <div key={rev.id} className="review-item">
                        <div className="review-header">
                            <img src={rev.avatar} alt="avt" className="review-avatar" />
                            <b>{rev.username}</b>
                            <span className="review-rating-stars">{"★".repeat(rev.rating)}</span>
                        </div>
                        <p className="review-text">{rev.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default RecipeReviews;