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
    const [activeTab, setActiveTab] = useState('recipes'); 
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

    // States cho chức năng xóa công thức của owner
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
    const [recipeToDelete, setRecipeToDelete] = useState(null); 
    
    // state sửa
    const [isEditRecipeModalOpen, setIsEditRecipeModalOpen] = useState(false); 
    const [recipeToEdit, setRecipeToEdit] = useState(null); 
    
    const userRecipes = recipes.filter(r => r.author_id == id);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                const resUser = await axiosClient.get(`/users/${id}?viewerId=${myId}`);
                setProfileUser(resUser.data);

                if (isOwner && resUser.data.is_premium === 1) {
                    const currentUserLocal = JSON.parse(localStorage.getItem('user'));
                    if (currentUserLocal && currentUserLocal.is_premium !== 1) {
                        currentUserLocal.is_premium = 1;
                        localStorage.setItem('user', JSON.stringify(currentUserLocal));
                        window.location.reload(); 
                    }
                }

                const [resRecipes, resFav] = await Promise.all([
                    axiosClient.get(`/recipes?userId=${id}`),
                    axiosClient.get(`/recipes/favorites/${myId}`)
                ]);

                setRecipes(resRecipes.data);
                setFavorites(resFav.data.map(f => f.id));
                
                const res = await axiosClient.get(`/recipes/cooked-history/${id}`);
                const formattedHistory = res.data.map(item => ({
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
            setError("Bạn cần đăng nhập để xem công thức này!");
            setIsLoading(false);
            navigate('/login-register');
            return;
        }
        if (id) fetchData();
    }, [id, myId, isOwner, navigate]);

    // Xử lý yêu thích
    const handleToggleFavorite = async (recipeId) => {
        try {
            const res = await axiosClient.post('/recipes/favorites/toggle', { userId: myId, recipeId });
            if (res.data.status === 'liked') setFavorites(prev => [...prev, recipeId]);
            else setFavorites(prev => prev.filter(favId => favId !== recipeId));
        } catch (err) { console.log(err); }
    };

    // Xử lý Follow
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

    // Hàm Chặn/Bỏ chặn
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

    const handleBlockToggle = () => {
        if (!myId) return setError("Bạn cần đăng nhập để thực hiện thao tác này!");
        setIsConfirmModalOpen(true); 
    };

    // Hàm mở modal xác nhận xóa món
    const handleDeleteClick = (recipe) => {
        setRecipeToDelete(recipe);
        setIsDeleteModalOpen(true);
    };

    // Thực hiện gọi API xóa
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
    
    return (
        <div className="profile-page-wrapper fadeIn">
            <div className="toast-container">
                {error && <Toast type="error" message={error} onClose={() => setError('')} />}
                {successMsg && <Toast type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}
            </div>

            <div className="profile-inner-wrapper">
                
                {/* HEADER CARD */}
                <div className="profile-header-card profile-card-override">
                    {/* Ảnh bìa */}
                    <div 
                        className="cover-photo profile-cover-dynamic" 
                        style={{ backgroundImage: `url(${profileUser.cover_img || 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1000'})` }}
                    >
                        <button className="btn-back-floating" onClick={() => navigate(-1)}>
                            ← Quay lại
                        </button>

                        {!isOwner && (
                            <button 
                                onClick={handleBlockToggle}
                                className={`btn-block-user ${isBlocked ? 'blocked' : ''}`}
                            >
                                {isBlocked ? <>🔓 Bỏ chặn</> : <>🚫 Chặn người dùng</>}
                            </button>
                        )}
                    </div>

                    <div className="profile-body profile-body-override">
                        {/* Avatar */}
                        <div className="profile-avatar-container">
                            <img 
                                src={profileUser.avatar} 
                                alt="Avatar" 
                                className={`profile-avatar-img ${profileUser.is_premium === 1 ? 'premium' : ''}`}
                            />
                            
                            {(profileUser.is_premium == 1 || profileUser.is_premium === true) && (
                                <div className="premium-crown-badge">👑</div>
                            )}
                        </div>

                        {/* Nút Hành động */}
                        <div className="profile-actions-row">
                            {isOwner ? (
                                <button className="btn-edit-profile" onClick={() => setIsEditModalOpen(true)}>
                                    ✏️ Chỉnh sửa hồ sơ
                                </button>
                            ) : (
                                <button 
                                    className={`btn-follow-profile ${profileUser.is_following ? 'following' : ''}`}
                                    onClick={handleFollowUser}
                                >
                                    {profileUser.is_following ? 'Đang theo dõi ✔' : '+ Theo dõi'}
                                </button>
                            )}
                        </div>

                        {/* Tên User */}
                        <div className="profile-info-content">
                            <h1 className="profile-name">
                                {profileUser.fullname}
                                {profileUser.is_premium == 1 && (
                                    <span title="Thành viên VIP Premium" className="premium-crown-title">👑</span>
                                )}
                            </h1>
                            <p className="profile-bio">
                                {profileUser.bio || "Người dùng này chưa viết giới thiệu."}
                            </p>
                        </div>

                        {/* Thống kê */}
                        <div className="profile-stats-custom">
                            <div className="stat-item-profile"><b>{userRecipes.length}</b><span>Công thức</span></div>
                            <div className="stat-item-profile"><b>{profileUser.stats?.followers || 0}</b><span>Followers</span></div>
                            <div className="stat-item-profile"><b>{profileUser.stats?.following || 0}</b><span>Following</span></div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="profile-tabs-container">
                    <h3 
                        className={`profile-tab ${activeTab === 'recipes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('recipes')}
                    >
                        {isOwner ? "Công thức của tôi" : `Bếp của ${profileUser.fullname}`}
                    </h3>
                    <h3 
                        className={`profile-tab ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        {isOwner ? "Lịch sử nấu nướng" : "Món đã nấu thành công"}
                    </h3>
                </div>

                {/* Content Area */}
                <div style={{ padding: '20px 0' }}>
                    {/* BỘ LỌC VÀ TÌM KIẾM ĐÃ ĐƯỢC LÀM SẠCH CSS */}
                    <div className="profile-filter-row">
                        <div className="profile-search-wrapper">
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm món ăn..." 
                                value={profileFilter.search}
                                onChange={(e) => setProfileFilter({...profileFilter, search: e.target.value})}
                                className="profile-search-input"
                            />
                        </div>
                        <select 
                            value={profileFilter.sort}
                            onChange={(e) => setProfileFilter({...profileFilter, sort: e.target.value})}
                            className="profile-sort-select"
                        >
                            <option value="newest">Mới nhất</option>
                            <option value="oldest">Cũ nhất</option>
                        </select>
                    </div>  

                    {activeTab === 'recipes' ? (
                        filteredRecipes.length > 0 ? (
                            isOwner ? (
                                /* BẢNG QUẢN LÝ MÓN ĂN ĐÃ ĐƯỢC LÀM SẠCH CSS */
                                <div className="profile-table-container">
                                    <table className="profile-table">
                                        <thead>
                                            <tr>
                                                <th>Món ăn</th>
                                                <th>Tác giả</th>
                                                <th>Ngày đăng</th>
                                                <th>Loại</th>
                                                <th>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredRecipes.map(item => (
                                                <tr key={item.id}>
                                                    <td className="profile-td-dish">
                                                        <img src={item.img || item.image || item.image_url} alt="dish" className="profile-td-img" />
                                                        <span className="profile-td-title">{item.title || item.name}</span>
                                                    </td>
                                                    <td className="profile-td-author">
                                                        @{profileUser.username || profileUser.fullname}
                                                    </td>
                                                    <td className="profile-td-date">
                                                        {new Date(item.created_at || Date.now()).toLocaleDateString('vi-VN')}
                                                    </td>
                                                    <td className="profile-td-type">
                                                        {item.is_premium || item.is_vip ? 'VIP' : 'Free'}
                                                    </td>
                                                    <td>
                                                        <div className="profile-action-btns">
                                                            <button 
                                                                onClick={() => navigate(`/recipe/${item.id}`)}
                                                                className="btn-profile-view">
                                                                Xem
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    setRecipeToEdit(item);
                                                                    setIsEditRecipeModalOpen(true);
                                                                }}
                                                                className="btn-profile-edit">
                                                                Sửa
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteClick(item)}
                                                                className="btn-profile-delete">
                                                                Xóa
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="product-grid profile-grid-override">
                                    {filteredRecipes.map(item => (
                                        <RecipeCard 
                                            key={item.id} item={item} 
                                            isFavorite={(favorites || []).includes(item.id)}
                                            onOpenModal={(recipe) => navigate(`/recipe/${recipe.id}`)}
                                            onViewProfile={(uid) => navigate(`/profile/${uid}`)}
                                            onToggleFavorite={handleToggleFavorite}
                                        />
                                    ))}
                                </div>
                            )
                        ) : (
                            <p className="empty-msg">Chưa có công thức nào.</p>
                        )
                    ) : (
                        <div className="product-grid profile-grid-override">
                            {filteredHistory.length > 0 ? (
                                filteredHistory.map((item, index) => {
                                    const fixedItem = {
                                        ...item,
                                        id: item.recipe_id || item.id, 
                                        author_name: item.author_name || item.fullname || item.username || 'Thành viên', 
                                        avatar: item.avatar || item.author_avatar || `https://ui-avatars.com/api/?name=User&background=random`
                                    };

                                    return (
                                        <div key={`cooked-${fixedItem.id}-${index}`} className="cooked-item-wrapper">
                                            <RecipeCard 
                                                item={fixedItem} 
                                                isFavorite={(favorites || []).includes(fixedItem.id)}
                                                onOpenModal={(recipe) => navigate(`/recipe/${recipe.id}`)}
                                                onViewProfile={(uid) => navigate(`/profile/${uid || fixedItem.author_id}`)}
                                                onToggleFavorite={handleToggleFavorite}
                                            />
                                            <div className="cooked-badge">✅ ĐÃ NẤU</div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="empty-msg">Chưa hoàn thành món ăn nào.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {isOwner && (
                <EditProfileModal 
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    currentUser={profileUser}
                    onUpdateSuccess={(updatedUser) => {
                        setProfileUser(updatedUser); 
                        setIsEditModalOpen(false);   
                    }}
                />
            )}
            
            {/* Modal Xác nhận Chặn/Bỏ chặn */}
            <ConfirmModal 
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={executeBlockAction}
                title={isBlocked ? "Bỏ chặn người dùng" : "Chặn người dùng"}
                message={isBlocked 
                    ? "Bạn có chắc chắn muốn bỏ chặn người dùng này để xem lại công thức của họ?" 
                    : "Nếu chặn, bạn sẽ không thể xem hồ sơ này và họ cũng không thể xem bài đăng của bạn."
                }
            />

            {/* Modal Xác nhận xóa công thức của owner */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={executeDelete}
                title={'Xóa công thức'}
                message={
                    recipeToDelete && (
                        <span>
                            Bạn có chắc chắn muốn xóa công thức <b>{recipeToDelete.title || recipeToDelete.name}</b> không? 
                            <br/><br/>
                            <small style={{color: 'red'}}>Hành động này không thể hoàn tác.</small>
                        </span>
                    )
                }
            />
            {/* Modal Sửa công thức */}
            <EditRecipeModal
                isOpen={isEditRecipeModalOpen}
                onClose={() => {
                    setIsEditRecipeModalOpen(false);
                    setRecipeToEdit(null);
                }}
                user={profileUser}
                editingRecipe={recipeToEdit}
                onUpdateSuccess={(updatedRecipe) => {
                    setRecipes(prev => prev.map(r => r.id === updatedRecipe.id ? updatedRecipe : r));
                    setSuccessMsg("Cập nhật thành công!");
                }}
            />
        </div>
    );
};

export default ProfilePage;