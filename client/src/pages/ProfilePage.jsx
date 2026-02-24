import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import RecipeCard from '../components/RecipeCard'; 
import EditProfileModal from '../components/modals/EditProfileModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import EditRecipeModal from '../components/modals/EditRecipeModal'; 
import Toast from '../components/Toast';
import '../index.css';

const ProfilePage = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    const myId = parseInt(localStorage.getItem('eatdish_user_id')); 
    const [activeMenuUserId, setActiveMenuUserId] = useState(null);
    const [activeTab, setActiveTab] = useState('recipes'); 
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); 
    const isOwner = parseInt(id) === myId; 

    // State quản lý dữ liệu và Modal
    const [profileUser, setProfileUser] = useState(null); 
    const [recipes, setRecipes] = useState([]); 
    const [favorites, setFavorites] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [cookedHistory, setCookedHistory] = useState([]);
    const [profileFilter, setProfileFilter] = useState({ search: '', sort: 'newest' });

    // States cho chức năng xóa, sửa công thức
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
    const [recipeToDelete, setRecipeToDelete] = useState(null); 
    const [isEditRecipeModalOpen, setIsEditRecipeModalOpen] = useState(false); 
    const [recipeToEdit, setRecipeToEdit] = useState(null); 
    
    // States cho Tab Bạn Bếp (Following) và Người Quan Tâm (Followers)
    const [followersList, setFollowersList] = useState([]);
    const [followingList, setFollowingList] = useState([]);
    const [isConnectionsLoaded, setIsConnectionsLoaded] = useState(false);

    const userRecipes = recipes.filter(r => r.author_id == id);
    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    useEffect(() => {
        const handleClickOutside = () => setIsMenuOpen(false);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                const resUser = await axiosClient.get(`/users/${id}?viewerId=${myId}`);
                setProfileUser(resUser.data);
                
                if (resUser.data.is_blocked) {
                    setIsBlocked(true);
                }

                if (isOwner && resUser.data.is_premium === 1) {
                    if (currentUser && currentUser.is_premium !== 1) {
                        currentUser.is_premium = 1;
                        localStorage.setItem('user', JSON.stringify(currentUser));
                    }
                }

                const [resRecipes, resFav, resHistory] = await Promise.all([
                    axiosClient.get(`/recipes?userId=${id}`),
                    axiosClient.get(`/recipes/favorites/${myId}`),
                    axiosClient.get(`/recipes/cooked-history/${id}`)
                ]);

                setRecipes(resRecipes.data);
                setFavorites(resFav.data.map(f => f.id));
                
                const formattedHistory = resHistory.data.map(item => ({
                    ...item,
                    id: item.recipe_id || item.id, 
                    author_name: item.author_name || item.fullname || item.username || 'Thành viên EatDish', 
                    avatar: item.avatar || item.author_avatar || `https://ui-avatars.com/api/?name=${item.author_name || 'User'}&background=random`
                }));
                setCookedHistory(formattedHistory);

            } catch (err) {
                if (err.response?.status === 403 || err.response?.status === 404) {
                    navigate('/not-found', { replace: true });
                    return; 
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (!myId) {
            setError("Bạn cần đăng nhập để xem hồ sơ này!");
            setIsLoading(false);
            navigate('/login-register');
            return;
        }
        if (id) fetchData();
    }, [id, myId, isOwner, navigate]);
        useEffect(() => {
            if (error || successMsg) {
                const timer = setTimeout(() => {
                    setError('');
                    setSuccessMsg('');
                }, 3000); 
                return () => clearTimeout(timer); 
            }
        }, [error, successMsg]);
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuUserId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);
    const fetchConnections = async () => {
        if (isConnectionsLoaded) return; 
        try {
            const [resFollowers, resFollowing] = await Promise.all([
                axiosClient.get(`/users/${id}/followers`),
                axiosClient.get(`/users/${id}/following`)
            ]);
            setFollowersList(resFollowers.data);
            setFollowingList(resFollowing.data);
            setIsConnectionsLoaded(true);
        } catch (error) {
            console.log("Lỗi lấy danh sách kết nối:", error);
        }
    };

    const handleToggleFavorite = async (recipeId) => {
        try {
            const res = await axiosClient.post('/recipes/favorites/toggle', { userId: myId, recipeId });
            if (res.data.status === 'liked') setFavorites(prev => [...prev, recipeId]);
            else setFavorites(prev => prev.filter(favId => favId !== recipeId));
        } catch (err) { console.log(err); }
    };

    const handleFollowUser = async () => {
        try {
            await axiosClient.post('/users/follow', { followerId: myId, followedId: id });
            setProfileUser(prev => ({
                ...prev,
                is_following: !prev.is_following,
                stats: {
                    ...prev.stats,
                    followers: prev.is_following ? prev.stats.followers - 1 : prev.stats.followers + 1
                }
            }));
        } catch (e) { console.log(e); }
    };
    const handleBlockToggle = () => {
        if (!myId) {
            return setError("Vui lòng đăng nhập để sử dụng tính năng này!");
        }
        setIsConfirmModalOpen(true); 
    };

    const executeBlockAction = async () => {
        try {
            if (isBlocked) {
                await axiosClient.post('/users/unblock', { blockerId: myId, blockedId: id });
                setSuccessMsg("Đã bỏ chặn thành công!");
                setIsBlocked(false);
            } else {
                await axiosClient.post('/users/block', { blockerId: myId, blockedId: id });
                navigate('/not-found'); 
            }
        } catch (err) {
            setError("Lỗi thao tác: " + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteClick = (recipe) => {
        setRecipeToDelete(recipe);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = async (e) => {
        if(e) e.preventDefault();
        setSuccessMsg('');
        try {
            await axiosClient.delete(`/recipes/${recipeToDelete.id}`);
            setRecipes(prev => prev.filter(r => r.id !== recipeToDelete.id)); 
            setIsDeleteModalOpen(false);
            setSuccessMsg("Xóa món thành công");
            setRecipeToDelete(null);
        } catch (err) {
            setError(err.response?.data?.message || "Có lỗi xảy ra khi xóa!");
            setIsDeleteModalOpen(false);
        }
    };

    const keyword = profileFilter.search.toLowerCase();
    
    const filteredRecipes = userRecipes
        .filter(r => (r.title || r.name || '').toLowerCase().includes(keyword))
        .sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return profileFilter.sort === 'newest' ? dateB - dateA : dateA - dateB;
        });

    const filteredHistory = cookedHistory
        .filter(r => (r.title || r.name || '').toLowerCase().includes(keyword))
        .sort((a, b) => {
            const dateA = new Date(a.cooked_at || a.created_at || 0);
            const dateB = new Date(b.cooked_at || b.created_at || 0);
            return profileFilter.sort === 'newest' ? dateB - dateA : dateA - dateB;
        });

    if (isLoading) return <div className="page-loading-msg">Đang tải hồ sơ... </div>;
    if (!profileUser) return <div className="page-loading-msg">Không tìm thấy người dùng này </div>;
    
    const renderUserGrid = (list, emptyMessage) => {
        if (list.length === 0) return <p className="empty-msg" style={{marginTop: '20px'}}>{emptyMessage}</p>;
        return (
            <div className="connections-grid">
                {list.map(user => (
                    <div key={user.id} className="connection-item" onClick={() => navigate(`/profile/${user.id}`)}>
                        <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.fullname || user.username}`} alt="avt" className="connection-avt" />
                        <div className="connection-info">
                            <h4 className="connection-name">{user.fullname || user.username}</h4>
                            <p className="connection-username">@{user.username}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    return (
        <div className="profile-page-wrapper fadeIn">
            <div className="toast-container">
                {error && <Toast type="error" message={error} onClose={() => setError('')} />}
                {successMsg && <Toast type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}
            </div>

            <div className="profile-inner-wrapper">
                
                <div className="eatdish-profile-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <button className="eatdish-btn-back" onClick={() => navigate(-1)} style={{ marginBottom: 0 }}>
                            ← Quay lại
                        </button>
                        {!isOwner && (
                            <div className="action-menu-wrapper" style={{ position: 'relative' }}>
                                <button 
                                    className="btn-three-dots" 
                                    onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                                    style={{ 
                                        background: 'none', border: 'none', cursor: 'pointer', 
                                        padding: '8px', display: 'flex', alignItems: 'center', 
                                        color: '#718096', borderRadius: '50%', transition: 'background 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#edf2f7'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M6 12c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm6-2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm8 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
                                    </svg>
                                </button>
                                {isMenuOpen && (
                                    <div className="dropdown-menu-container" style={{ top: '100%', right: 0 }} onClick={e => e.stopPropagation()}>
                                        <button onClick={handleBlockToggle} className="dropdown-item block">
                                            <span>{isBlocked ? '🔓' : ''}</span> 
                                            {isBlocked ? 'Bỏ chặn' : 'Chặn '}
                                        </button>
                                        <button onClick={() => setError("Tính năng báo cáo đang phát triển")} className="dropdown-item report">
                                            <span>Báo cáo vi phạm</span> 
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="eatdish-top-info">
                        <img src={profileUser.avatar || 'https://via.placeholder.com/100'} alt="avatar" className="eatdish-avatar" />
                        <div className="eatdish-name-box">
                            <h2 className="eatdish-fullname">
                                {profileUser.fullname}
                                {(profileUser.is_premium == 1 || profileUser.is_premium === true) && <span title="Thành viên VIP" style={{marginLeft: '5px', fontSize: '18px'}}>👑</span>}
                            </h2>
                            <p className="eatdish-username">@{profileUser.username}</p>
                            {profileUser.location && <p className="eatdish-location">📍 {profileUser.location}</p>}
                        </div>
                    </div>

                    <div className="eatdish-stats-box">
                        <span 
                            className={`stat-clickable ${activeTab === 'following' ? 'stat-active' : ''}`}
                            onClick={() => { setActiveTab('following'); fetchConnections(); }}
                        >
                            <strong>{profileUser?.stats?.following || 0}</strong> Bạn Bếp
                        </span>
                        <span 
                            className={`stat-clickable ${activeTab === 'followers' ? 'stat-active' : ''}`}
                            onClick={() => { setActiveTab('followers'); fetchConnections(); }}
                        >
                            <strong>{profileUser?.stats?.followers || 0}</strong> Người quan tâm
                        </span>
                    </div>

                    <div className="eatdish-bio-box">
                        {profileUser?.bio && profileUser.bio.trim() !== "" ? <p>{profileUser.bio}</p> : <p className="text-muted" style={{color: '#999'}}>{isOwner ? "Bạn chưa viết giới thiệu bản thân." : "Người dùng này chưa viết giới thiệu."}</p>}
                    </div>

                    <div className="eatdish-action-box" style={{ display: 'flex', gap: '10px' }}>
                        {isOwner ? (
                            <button className="eatdish-btn-action btn-edit-white" onClick={() => setIsEditModalOpen(true)}>Sửa thông tin cá nhân</button>
                        ) : (
                            <>
                                <button className={`eatdish-btn-action btn-follow-dark ${profileUser.is_following ? 'following' : ''}`} onClick={handleFollowUser}>
                                    {profileUser.is_following ? 'Đang theo dõi ✔' : 'Kết Bạn Bếp'}
                                </button>
                                    
                            </>
                        )}
                    </div>

                    <div className="eatdish-tabs-wrapper">
                        <div className={`eatdish-tab ${activeTab === 'recipes' ? 'active' : ''}`} onClick={() => setActiveTab('recipes')}>
                            Công thức ({userRecipes.length})
                        </div>
                        <div className={`eatdish-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                            Đã nấu ({cookedHistory.length})
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ padding: '20px 0', maxWidth: '600px', margin: '0 auto' }}>
                    
                    {(activeTab === 'recipes' || activeTab === 'history') && (
                        <div className="profile-filter-row">
                            <div className="profile-search-wrapper">
                                <input type="text" placeholder="Tìm kiếm món ăn..." value={profileFilter.search} onChange={(e) => setProfileFilter({...profileFilter, search: e.target.value})} className="profile-search-input" />
                            </div>
                            <select value={profileFilter.sort} onChange={(e) => setProfileFilter({...profileFilter, sort: e.target.value})} className="profile-sort-select">
                                <option value="newest">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
                            </select>
                        </div>  
                    )}

                    {activeTab === 'recipes' && (
                        filteredRecipes.length > 0 ? (
                            isOwner ? (
                                <div className="profile-table-container">
                                    <table className="profile-table">
                                        <thead>
                                            <tr><th>Món ăn</th><th>Ngày đăng</th><th>Loại</th><th>Hành động</th></tr>
                                        </thead>
                                        <tbody>
                                            {filteredRecipes.map(item => (
                                                <tr key={item.id}>
                                                    <td className="profile-td-dish"><img src={item.img || item.image || item.image_url} alt="dish" className="profile-td-img" /><span className="profile-td-title">{item.title || item.name}</span></td>
                                                    <td className="profile-td-date">{new Date(item.created_at || Date.now()).toLocaleDateString('vi-VN')}</td>
                                                    <td className="profile-td-type">{item.is_premium || item.is_vip ? 'VIP' : 'Free'}</td>
                                                    <td>
                                                        <div className="profile-action-btns">
                                                            <button onClick={() => navigate(`/recipe/${item.id}`)} className="btn-profile-view">Xem</button>
                                                            <button onClick={() => { setRecipeToEdit(item); setIsEditRecipeModalOpen(true); }} className="btn-profile-edit">Sửa</button>
                                                            <button onClick={() => handleDeleteClick(item)} className="btn-profile-delete">Xóa</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="product-grid profile-grid-override">
                                    {filteredRecipes.map(item => <RecipeCard key={item.id} item={item} isFavorite={(favorites || []).includes(item.id)} onOpenModal={(recipe) => navigate(`/recipe/${recipe.id}`)} onViewProfile={(uid) => navigate(`/profile/${uid}`)} onToggleFavorite={handleToggleFavorite} />)}
                                </div>
                            )
                        ) : <p className="empty-msg" style={{marginTop: '20px'}}>Chưa có công thức nào.</p>
                    )}

                    {activeTab === 'history' && (
                        <div className="product-grid profile-grid-override">
                            {filteredHistory.length > 0 ? (
                                filteredHistory.map((item, index) => {
                                    const fixedItem = { ...item, id: item.recipe_id || item.id, author_name: item.author_name || item.fullname || item.username || 'Thành viên' };
                                    return (
                                        <div key={`cooked-${fixedItem.id}-${index}`} className="cooked-item-wrapper">
                                            <RecipeCard item={fixedItem} isFavorite={(favorites || []).includes(fixedItem.id)} onOpenModal={(recipe) => navigate(`/recipe/${recipe.id}`)} onViewProfile={(uid) => navigate(`/profile/${uid || fixedItem.author_id}`)} onToggleFavorite={handleToggleFavorite} />
                                            <div className="cooked-badge">✅ ĐÃ NẤU</div>
                                        </div>
                                    );
                                })
                            ) : <p className="empty-msg" style={{marginTop: '20px'}}>Chưa hoàn thành món ăn nào.</p>}
                        </div>
                    )}

                    {activeTab === 'following' && renderUserGrid(followingList, "Chưa theo dõi Bạn Bếp nào.")}
                    {activeTab === 'followers' && renderUserGrid(followersList, "Chưa có người quan tâm nào.")}

                </div>
            </div>

            {isOwner && <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} currentUser={profileUser} onUpdateSuccess={(updatedUser) => { setProfileUser(updatedUser); setIsEditModalOpen(false); }} />}
            <ConfirmModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={executeBlockAction} title={isBlocked ? "Bỏ chặn" : "Chặn người này"} message={isBlocked ? "Họ sẽ có thể xem lại trang cá nhân của bạn." : "Họ sẽ không thể xem trang cá nhân và các món ăn của bạn nữa!"} />
            
            <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={executeDelete} title={'Xóa công thức'} message={<span>Chắc chắn xóa <b>{recipeToDelete?.title || recipeToDelete?.name}</b>?</span>} />
            <EditRecipeModal isOpen={isEditRecipeModalOpen} onClose={() => { setIsEditRecipeModalOpen(false); setRecipeToEdit(null); }} user={profileUser} editingRecipe={recipeToEdit} onUpdateSuccess={(updatedRecipe) => { setRecipes(prev => prev.map(r => r.id === updatedRecipe.id ? updatedRecipe : r)); setSuccessMsg("Cập nhật thành công!"); }} />
        </div>
    );
};

export default ProfilePage;