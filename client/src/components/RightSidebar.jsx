import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import PremiumModal from '../components/modals/PremiumModal';
import '../index.css';

const RightSidebar = ({ user, unreadCount, notifications, showNotifDropdown, handleToggleNotifications, handleLogout, onOpenModal }) => {
    const navigate = useNavigate();
    const [topChefs, setTopChefs] = useState([]);
    const [trending, setTrending] = useState([]);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const [isGuest, setIsGuest] = useState(false);
    const notifRef = useRef(null);
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        setIsGuest(!storedUser || JSON.parse(storedUser).id === null);
    }, []);

    useEffect(() => {
        const userId = localStorage.getItem('eatdish_user_id') || '';
        axiosClient.get(`/users/top-chefs?userId=${userId}`)
            .then(res => setTopChefs(res.data))
            .catch(err => console.log("Lỗi lấy Top Chef:", err));
        const fetchTrending = async () => {
            try { 
                setTrending((await axiosClient.get(`/recipes/trending?userId=${userId}`)).data); 
            } 
            catch (err) { console.log("Lỗi lấy món hot:", err); }
        };
        fetchTrending();
    }, []);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showNotifDropdown && notifRef.current && !notifRef.current.contains(event.target)) {
                handleToggleNotifications(); 
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showNotifDropdown, handleToggleNotifications]);

    const handleOpenProfile = (id) => {
        if (isGuest) return navigate('/not-found');
        navigate(`/profile/${id}`);
    };

    const handleUpgradeSuccess = () => {
        const updatedUser = { ...user, is_premium: 1 };
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <aside className={`sidebar-right-panel ${isPremiumModalOpen ? 'z-max' : ''}`}>
            <div className="user-panel-header">
                
                <div className="rs-notif-wrapper" ref={notifRef}>
                    <span 
                        onClick={handleToggleNotifications} 
                        className="rs-notif-icon">
                        🔔
                    </span>
                    {unreadCount > 0 && (
                        <div className="rs-notif-badge">
                            {unreadCount}
                        </div>
                    )}
                    
                    {showNotifDropdown && (
                        <div className="rs-notif-dropdown show fadeIn">
                            <div className="rs-notif-header">Thông báo mới</div>
                            <div className="rs-notif-list">
                                {notifications.length > 0 ? notifications.map(n => (
                                    <div key={n.id} className={`rs-notif-item ${n.is_read ? 'read' : 'unread'}`}>
                                        {n.message}
                                        <div className="rs-notif-date">{new Date(n.created_at).toLocaleDateString()}</div>
                                    </div>
                                )) : <div className="rs-notif-empty">Không có thông báo.</div>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Phần Avatar + Tên */}
                <div 
                    onClick={() => navigate(`/profile/${user.id}`)} 
                    className="rs-user-profile-trigger">
                    <div className="rs-avatar-wrapper">
                        <img src={user.avatar} className={`rs-avatar-img ${user.is_premium === 1 ? 'premium' : ''}`} alt="Avatar" />
                    </div>
                    
                    <span className="rs-user-name" >
                        {user.fullname}
                        {user.is_premium === 1 && <span title="Thành viên VIP" className="rs-premium-crown">👑</span>}
                    </span>
                </div>

                {/* Nút Đăng xuất */}
                {isGuest ? (
                    <div className="rs-auth-links">
                        <span onClick={() => navigate('/login-register')} className="rs-auth-text" >Đăng Nhập</span>
                    </div>
                ) : (
                    <div onClick={handleLogout} className="rs-auth-links">
                        <span className="rs-auth-text">Đăng xuất</span>
                    </div>
                )}
            </div>

            <div className="default-right-view fadeIn">
                {/* TOP CHEF */}
                <div className="top-chef-section">
                    <div className="top-chef-header">
                        <h3 className="top-chef-title">🏆 Top Đầu Bếp</h3>
                    </div>

                    {user && user.is_premium !== 1 && (
                        <div onClick={() => setIsPremiumModalOpen(true)} className="rs-floating-premium-btn">
                            <span>👑</span> 
                        </div>
                    )}

                    {topChefs.length > 0 ? topChefs.map((chef, idx) => (
                        <div key={chef.id} onClick={() => handleOpenProfile(chef.id)} className="top-chef-item">
                            <div className="top-chef-rank">
                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                            </div>
                            <img src={chef.avatar || "https://ui-avatars.com/api/?name=" + chef.username} alt="" className="top-chef-avatar" />
                            <div className="top-chef-info">
                                <div className="top-chef-name">{chef.fullname || chef.username}</div>
                                <div className="top-chef-likes">❤️ {chef.total_likes} tim</div>
                            </div>
                        </div>
                    )) : (
                        <div className="top-chef-empty">Chưa có dữ liệu xếp hạng</div>
                    )}
                </div>
            </div>

            {/* MÓN ĐANG HOT */}
            <div className="scrollable-hot-section">
                <div className="trending-header-sticky">
                    <h2 className="trending-title">🔥 Đang Hot</h2>
                </div>
                
                <div className="hot-list">
                    {trending.length > 0 ? trending.map((item) => (
                        <div className="trending-item-card" onClick={() => onOpenModal(item)} key={item.id}>
                            <img src={item.img} className="trending-img" alt={item.name} />
                            <div className="trending-info">
                                <h4 className="trending-item-name">{item.name}</h4>
                                <p className="trending-item-likes">❤️ {item.total_likes} lượt thích</p>
                            </div>
                        </div>
                    )) : (
                        <p className="trending-empty-msg">Chưa có món ăn nào được yêu thích...</p>
                    )}
                </div>

                <PremiumModal 
                    isOpen={isPremiumModalOpen} 
                    onClose={() => setIsPremiumModalOpen(false)}
                    user={user} onUpgradeSuccess={handleUpgradeSuccess}
                />
            </div>
        </aside>
    );
};
export default RightSidebar;