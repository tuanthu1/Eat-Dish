import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import RecipesView from '../components/view/RecipesView';
import CommunityView from '../components/view/CommunityView';
import FavoritesView from '../components/view/FavoritesView';
import SettingView from '../components/view/SettingView';
import RightSidebar from '../components/RightSidebar';
import RecipeDetailModal from '../components/modals/RecipeDetailModal';
import FilterModal from '../components//modals/FilterModal';
import ChatBot from '../components/ChatBot';
import AccountSettingsView from '../components/view/AccountSettingsView';
import NotificationSettingsView from '../components/view/NotificationSettingsView';
import UploadModal from '../components/modals/UploadModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import Toast from '../components/Toast';
import PremiumView from '../components/view/PremiumView';
import PremiumModal from '../components/modals/PremiumModal';
import '../index.css'; 

const HomePage = () => {
    const navigate = useNavigate();
    // STATES 
    const [error, setError] = useState(''); 
    const [successMsg, setSuccessMsg] = useState(''); 
    const [isLoading, setIsLoading] = useState(false); 
    const [recipes, setRecipes] = useState([]);
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem('eatdish_active_tab') || 'recipes';
    }); 
    const [showFilter, setShowFilter] = useState(false); 
    const [filters, setFilters] = useState({ maxCal: '', maxTime: '' }); 
    const [blockedUserIds, setBlockedUserIds] = useState([]);
    const [isConfirmModalLogOut, setIsConfirmModalLogOut] = useState(false);
    const [favorites, setFavorites] = useState([]); 
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false); 
    const [uploadData, setUploadData] = useState({
        name: '', description: '', calories: '', time: '', 
        image: null, ingredients: [], steps: []
    }); 
    const [showChatBot, setShowChatBot] = useState(false); 
    const location = useLocation(); 
    const [uploadPreview, setUploadPreview] = useState(null); 
    const [isExpiredAlert, setIsExpiredAlert] = useState(false);
    const [isUpgradeModal, setIsUpgradeModal] = useState(false);

    // State cho Cộng đồng (Community)
    const [communityPosts, setCommunityPosts] = useState([]); 
    const [postContent, setPostContent] = useState(''); 
    const [postImage, setPostImage] = useState(null); 
    const [imagePreview, setImagePreview] = useState(null); 
    const [replyingTo, setReplyingTo] = useState(null); 
    const [editingPostId, setEditingPostId] = useState(null);  
    const [editPostContent, setEditPostContent] = useState(''); 
    const [editPostImage, setEditPostImage] = useState(null); 
    const [editImagePreview, setEditImagePreview] = useState(null);
    
    // State cho Thông báo
    const [notifications, setNotifications] = useState([]); 
    const [selectedRecipe, setSelectedRecipe] = useState(null); 
    const [showNotifDropdown, setShowNotifDropdown] = useState(false); 
    
    // State cho Modal và Cài đặt
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
    const [accountSubView, setAccountSubView] = useState('main'); 
    const [passwordData, setPasswordData] = useState({ old: '', new: '', confirm: '' }); 
    
    // State cho Comment 
    const [activeCommentPostId, setActiveCommentPostId] = useState(null); 
    const [commentsList, setCommentsList] = useState([]); 
    const [commentText, setCommentText] = useState('');   

    // State User
    const [user, setUser] = useState({
        id: null,
        fullname: 'Khách',
        username: 'Khách',
        avatar: `https://ui-avatars.com/api/?name= Khách&background=random&length=2&size=128`,
        cover_img: '',
        bio: '',
        stats: { recipes: 0, followers: 0, following: 0 }
    });
    
    const isGuest = !user || !user.id || user.id === null; 

    const handleTabChange = (tab) => {
        const restrictedTabs = ['favorites', 'community', 'settings', 'account_settings', 'profile', 'premium'];
        
        if (isGuest && restrictedTabs.includes(tab)) {
            setError("Vui lòng đăng nhập để truy cập mục này!");
            return;
        }
        
        setActiveTab(tab);
        localStorage.setItem('eatdish_active_tab', tab);
        window.scrollTo(0, 0);
    };

    //  HANDLERS 
    const handleSearch = async (keyword, e) => {
         if(e) {e.preventDefault();}
        try {
            const url = keyword ? `/recipes/search?q=${keyword}` : `/recipes`; 
            const res = await axiosClient.get(url);
            setRecipes(res.data);
        } catch (err) {
            console.log("Lỗi tìm kiếm:", err);
        }
    };

    const handleOpenRecipe = (recipe) => {
        if (isGuest) {
            setError("Vui lòng đăng nhập để thực hiện hành động này!");
            return;
        }
        setSelectedRecipe(recipe);
    };

    const handleViewProfile = async (targetUserId) => {
        if (isGuest) {
            setError("Vui lòng đăng nhập để xem trang cá nhân!");
            navigate('/login');
            return;
        }
        if (!targetUserId) return;
        navigate(`/profile/${targetUserId}`);
    };
    
    const handleDeletePost = async (postId, e) => {
         if(e) {e.preventDefault();}
        try {
            await axiosClient.delete(`/community/${postId}?userId=${user.id}`);
            setCommunityPosts(communityPosts.filter(p => p.id !== postId)); 
            setSuccessMsg("Đã xóa bài viết!");
        } catch (err) { setError("Lỗi khi xóa bài"); console.log(err); }
    };

    const handleEditImageChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(selectedFile.type)) {
            alert("Vui lòng chọn định dạng ảnh hợp lệ (JPG, PNG, WebP)!");
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB.");
            return;
        }

        if (uploadPreview && uploadPreview.startsWith('blob:')) {
            URL.revokeObjectURL(uploadPreview);
        }

        const objectUrl = URL.createObjectURL(selectedFile);
        setUploadPreview(objectUrl); 
        setUploadData((prev) => ({ ...prev, image: selectedFile }));
    };
        
    const handleUpdatePost = async (postId, e) => {
        if(e) e.preventDefault();
        if (!editPostContent.trim()) return;
        if (!user?.id) return setError("Phiên đăng nhập hết hạn.");

        setCommunityPosts(prev => prev.map(p => 
            p.id === postId ? { ...p, content: editPostContent } : p
        ));
        setEditingPostId(null);

        const formData = new FormData();
        formData.append('userId', user.id);
        formData.append('content', editPostContent);
        
        if (editPostImage) formData.append('image', editPostImage);

        try {
            const res = await axiosClient.put(`/community/${postId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.status === 200) {
                setSuccessMsg('Cập nhật thành công!');
            }
        } catch (err) {
            console.error("Chi tiết lỗi Backend:", err.response?.data || err.message);
            setError('Server bị lỗi khi lưu bài viết.');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPostImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmitPost = async (e) => {
         if(e) {e.preventDefault();}
        if (!user || !user.id) {
            setError("Vui lòng đăng nhập để thực hiện hành động này!");
            return;
        }
        if (!postContent && !postImage) return setError("Vui lòng nhập nội dung hoặc chọn ảnh để đăng.");

        const formData = new FormData();
        formData.append('userId', user.id);
        formData.append('content', postContent);
        if (postImage) formData.append('image', postImage);

        try {
            await axiosClient.post('/community', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setPostContent('');
            setPostImage(null);
            setImagePreview(null);
            setSuccessMsg("Đã đăng bài thành công!");
            
            try {
                const res = await axiosClient.get('/community');
                setCommunityPosts(res.data);
            } catch (e) {}

        } catch (err) {
            console.log(err);
            setError("Lỗi khi đăng bài.");
        }
    };
    
    const handleLikePost = async (postId, e) => {
         if(e) {e.preventDefault();}
        try {
            setCommunityPosts(prevPosts => prevPosts.map(post => {
                if (post.id === postId) {
                    const newLikesCount = post.is_liked ? post.likes_count - 1 : post.likes_count + 1;
                    return { ...post, is_liked: !post.is_liked, likes_count: newLikesCount };
                }
                return post;
            }));

            await axiosClient.post('/community/like', { userId: user.id, postId });
            
        } catch (err) { 
            console.log(err);
            setError("Lỗi khi thả tim. Vui lòng thử lại.");
            const res = await axiosClient.get(`/community?userId=${user.id}`);
            setCommunityPosts(res.data);
        }
    };

    const toggleComments = async (postId, e) => {
         if(e) {e.preventDefault();}
        if (activeCommentPostId === postId) {
            setActiveCommentPostId(null); 
        } else {
            setActiveCommentPostId(postId); 
            const res = await axiosClient.get(`/community/comments/${postId}`);
            setCommentsList(res.data);
        }
    };

    const handleSubmitRecipe = async () => {
        if (isGuest) return setError("Vui lòng đăng nhập để thực hiện hành động này!");
        if (!user || !user.id) return setError("Lỗi phiên đăng nhập. Vui lòng F5 lại trang.");
        if (!uploadData.name || !uploadData.name.trim()) return setError("Vui lòng nhập tên món ăn!");
        if (!uploadData.image) return setError("Vui lòng chọn ảnh cho món ăn ");
        if (uploadData.ingredients.length === 0) return setError("Vui lòng thêm ít nhất 1 nguyên liệu!");
        if (uploadData.steps.length === 0) return setError("Vui lòng thêm ít nhất 1 bước thực hiện!");

        setError(""); 
        const parsedTime = uploadData.time ? parseInt(String(uploadData.time).replace(/[^0-9]/g, '')) || 0 : 0;
        const parsedCalories = uploadData.calories ? parseInt(String(uploadData.calories).replace(/[^0-9]/g, '')) || 0 : 0;

        const formData = new FormData();
        formData.append('userId', user.id);
        formData.append('name', uploadData.name);
        formData.append('description', uploadData.description);
        
        formData.append('calories', parsedCalories); 
        formData.append('time', parsedTime); 
        
        formData.append('img', uploadData.image);
        formData.append('ingredients', JSON.stringify(uploadData.ingredients));
        formData.append('steps', JSON.stringify(uploadData.steps));
        formData.append('video_url', uploadData.video_url || '');
        
        formData.append('is_premium', uploadData.is_premium ? 1 : 0);

        try {
            const res = await axiosClient.post('/recipes/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                setSuccessMsg("Đăng công thức thành công!"); 
                setIsUploadModalOpen(false);
                
                setUploadData({ name: '', description: '', calories: '', time: '', image: null, ingredients: [], steps: [], is_premium: 0 });
                setUploadPreview(null);
            }
        } catch (err) {
            console.error(err);
            setError("Lỗi khi tải công thức lên.");
        }
    };
    const handleToggleFavorite = async (recipeId, e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        if (isGuest) return setError("Vui lòng đăng nhập để thả tim món ăn này!");
        
        try {
            const res = await axiosClient.post('/recipes/favorites/toggle', { userId: user.id, recipeId });
            if (res.data.status === 'liked') {
                setFavorites(prev => [...prev, recipeId]);
            } else {
                setFavorites(prev => prev.filter(id => id !== recipeId));
            }
        } catch (err) { 
            console.error("Lỗi yêu thích:", err);
            setError("Có lỗi xảy ra, vui lòng thử lại sau.");
        }
    };

    const handleChangePassword = async (e) => {
        if(isGuest) return setError("Vui lòng đăng nhập để thực hiện hành động này!");
        if(e) {e.preventDefault();}
        if (passwordData.new !== passwordData.confirm) return setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
        
        try {
            const res = await axiosClient.put('/auth/change-password', {
                userId: user.id,
                oldPassword: passwordData.old,
                newPassword: passwordData.new
            });
            if (res.data.status === 'success') {
                setSuccessMsg("Đổi mật khẩu thành công!");
                setAccountSubView('main');
                setPasswordData({ old: '', new: '', confirm: '' });
            }
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi khi đổi mật khẩu");
        }
    };

    const handleDeleteAccount = async (e) => {
        if (isGuest) return setError("Vui lòng đăng nhập để thực hiện hành động này!");
        if(e) {e.preventDefault();}
        
        if (window.confirm("BẠN CÓ CHẮC CHẮN? Toàn bộ dữ liệu sẽ mất vĩnh viễn!")) {
            try {
                const res = await axiosClient.delete(`/users/${user.id}`);
                if (res.data.status === 'success') {
                    setSuccessMsg("Tài khoản của bạn đã bị xóa.");
                    localStorage.clear();
                    window.location.href = '/login-register';
                }
            } catch (err) {
                console.log(err);
                setError(err.response?.data?.message || "Không thể xóa tài khoản lúc này.");
            }
        }
    };

    const handleToggleNotifications = async (e) => {
        if(isGuest) return setError("Vui lòng đăng nhập để thực hiện hành động này!");
        if(e) {e.preventDefault();}
        
        setShowNotifDropdown(!showNotifDropdown);

        if (!showNotifDropdown && unreadCount > 0) {
            try {
                await axiosClient.put('/notifications/read-all', { userId: user.id });
                setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
            } catch (err) {
                console.log("Lỗi đánh dấu đã đọc:", err);
                setError("Lỗi đánh dấu");
            }
        }
    };

    const handleOpenChatBot = () => {
        if (isGuest) {
            setError("Bạn cần đăng nhập để trò chuyện với trợ lý ảo! ");
            return;
        }
        setShowChatBot(true);
    };

    const handleLogout = () => {
        setIsConfirmModalLogOut(true);
    };

    const executeLogout = () => {
        localStorage.clear();
        window.location.href = '/login-register';
    };
    const handleAcceptUpgrade = () => {
    setIsUpgradeModal(true); // Mở modal chọn gói
};
    
    // EFFECT
   useEffect(() => {
        if (location.state && location.state.viewProfileId) {
            const targetId = location.state.viewProfileId;
            handleViewProfile(targetId);
            window.history.replaceState({}, document.title);
        }
    }, [location]);
    useEffect(() => {
        localStorage.setItem('eatdish_active_tab', activeTab);
    }, [activeTab]);
    useEffect(() => {
        const fetchData = async () => {
            const storedId = localStorage.getItem('eatdish_user_id');
            if (!storedId) return;

            try {
                const resUser = await axiosClient.get(`/users/${storedId}`);
                setUser(resUser.data);
                localStorage.setItem('user', JSON.stringify(resUser.data));
                
                const [resRec, resFav, resNotif, resComm, resBlocks] = await Promise.all([
                    axiosClient.get(`/recipes?userId=${storedId}`),
                    axiosClient.get(`/recipes/favorites/${storedId}`),
                    axiosClient.get(`/notifications/${storedId}`),
                    axiosClient.get(`/community?userId=${storedId}`),
                    axiosClient.get(`/users/blocks?userId=${storedId}`) 
                ]);
                setRecipes(resRec.data);
                setFavorites(resFav.data.map(f => f.id));
                setNotifications(resNotif.data);
                setCommunityPosts(resComm.data);
                if (resBlocks && resBlocks.data) {
                const blockedIdsArray = Array.isArray(resBlocks.data) 
                    ? resBlocks.data.map(item => Number(item.id || item.block_id || item)) 
                    : [];
                setBlockedUserIds(blockedIdsArray);
            }

            } catch (err) {
                console.log("Lỗi chung:", err);
            }
        };

        fetchData();
    }, []);
    useEffect(() => {
        const data = localStorage.getItem('user');
        if (data) {
            const storedUser = JSON.parse(data);
            if (storedUser.premium_expired === true) {
                console.log("Phát hiện hết hạn, đang mở Modal...");
                setIsExpiredAlert(true);
                const updatedUser = { ...storedUser };
                delete updatedUser.premium_expired;
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        }
    }, []);

    useEffect(() => {
        if (error || successMsg) {
            const timer = setTimeout(() => {
                setError('');
                setSuccessMsg('');
            }, 3000); 
            return () => clearTimeout(timer); 
        }
    }, [error, successMsg]);

    const unreadCount = notifications.filter(n => n.is_read === 0).length;
    const visibleRecipes = recipes.filter(r => 
        !blockedUserIds.includes(Number(r.author_id)) && 
        !blockedUserIds.includes(Number(r.user_id))
    );

    const visibleCommunity = communityPosts.filter(p => 
        !blockedUserIds.includes(Number(p.user_id)) && 
        !blockedUserIds.includes(Number(p.author_id))
    );

    return (
        <div className="dashboard">
            <div className="toast-container">
                {error && <Toast type="error" message={error} onClose={() => setError('')} />}
                {successMsg && <Toast type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}
            </div>
            
            <Sidebar 
                activeTab={activeTab}
                setActiveTab={handleTabChange} 
                onOpenUpload={isGuest ? () => setError("Vui lòng đăng nhập để tải công thức!") : () => setIsUploadModalOpen(true)} 
                currentUser={user} 
                unreadCount={isGuest ? 0 : unreadCount} 
            />
            
            <ChatBot isOpen={handleOpenChatBot} onClose={() => setShowChatBot(false)} />

            <main className="main-content">
                <Navbar 
                    onSearch={(keyword, e) => { 
                        if (keyword || e) {
                            handleTabChange('recipes');
                        }
                        handleSearch(keyword, e); 
                    }} 
                    onOpenFilter={() => setShowFilter(true)} 
                />
                                
                <FilterModal 
                    isOpen={showFilter}
                    onClose={() => setShowFilter(false)} 
                    onApply={async (newFilters) => {
                        setFilters(newFilters);
                        setShowFilter(false);
                        setActiveTab('recipes');
                        try {
                            setIsLoading(true);
                            const { maxCal, maxTime, ingredient } = newFilters; 
                            const res = await axiosClient.get(`/recipes/filter?maxCal=${maxCal}&maxTime=${maxTime}&ing=${ingredient}`);
                            setRecipes(res.data);
                            if (res.data.length === 0) setError("Không tìm thấy món phù hợp.");
                            else setSuccessMsg(`Tìm thấy ${res.data.length} món phù hợp!`);
                        } catch (err) {
                            setError("Lỗi khi áp dụng bộ lọc");
                        } finally {
                            setIsLoading(false);
                        }
                    }}
                />

                {activeTab === 'recipes' && (
                    <RecipesView 
                        recipes={visibleRecipes}
                        favorites={favorites} 
                        handleToggleFavorite={handleToggleFavorite}
                        setSelectedRecipe={handleOpenRecipe} 
                        handleViewProfile={handleViewProfile} 
                        openPublicProfile={handleViewProfile}
                    />
                )}

                {activeTab === 'favorites' && (
                    <FavoritesView 
                        recipes={recipes} favorites={favorites} handleToggleFavorite={handleToggleFavorite} 
                        setSelectedRecipe={handleOpenRecipe} handleViewProfile={handleViewProfile}
                    />
                )}

                {activeTab === 'community' && (
                    <CommunityView 
                        user={user} communityPosts={visibleCommunity} postContent={postContent} setPostContent={setPostContent}
                        imagePreview={imagePreview} setImagePreview={setImagePreview} postImage={postImage} setPostImage={setPostImage}
                        handleFileChange={handleFileChange} handleSubmitPost={handleSubmitPost} handleLikePost={handleLikePost}
                        handleDeletePost={handleDeletePost} handleUpdatePost={handleUpdatePost} editingPostId={editingPostId} setEditingPostId={setEditingPostId}
                        editPostContent={editPostContent} setEditPostContent={setEditPostContent} editPostImage={editPostImage}
                        setUploadData={setUploadData} setUploadPreview={setUploadPreview} setEditPostImage={setEditPostImage}
                        editImagePreview={editImagePreview} setEditImagePreview={setEditImagePreview} handleEditFileChange={handleEditImageChange}
                        toggleComments={toggleComments} activeCommentPostId={activeCommentPostId} commentsList={commentsList} setCommentsList={setCommentsList}
                        commentText={commentText} setCommentText={setCommentText} replyingTo={replyingTo} setReplyingTo={setReplyingTo} handleViewProfile={handleViewProfile} setCommunityPosts={setCommunityPosts}
                    />
                )}

                {activeTab === 'premium' && (
                    <PremiumView user={user} />
                )}

                {activeTab === 'profile' && (
                    <Profile 
                        user={user} recipes={recipes} favorites={favorites || []} handleToggleFavorite={handleToggleFavorite}
                        setSelectedRecipe={setSelectedRecipe} setActiveTab={setActiveTab} setIsEditModalOpen={setIsEditModalOpen}
                    />
                )}

                {activeTab === 'settings' && <SettingView setActiveTab={setActiveTab} handleLogout={handleLogout} />}
                
                {activeTab === 'account_settings' && (
                    <AccountSettingsView 
                        setActiveTab={setActiveTab} accountSubView={accountSubView} setAccountSubView={setAccountSubView}
                        passwordData={passwordData} setPasswordData={setPasswordData} handleChangePassword={handleChangePassword}
                        handleDeleteAccount={handleDeleteAccount}
                    />
                )}
                
                {activeTab === 'notifications_settings' && <NotificationSettingsView setActiveTab={setActiveTab} />}
            </main>

            <RightSidebar 
                user={user} unreadCount={unreadCount} notifications={notifications} showNotifDropdown={showNotifDropdown}
                handleToggleNotifications={handleToggleNotifications} handleLogout={handleLogout} onOpenModal={handleOpenRecipe}
                setActiveTab={setActiveTab} handleViewProfile={handleViewProfile}
            />

            <RecipeDetailModal isOpen={!!selectedRecipe} onClose={() => setSelectedRecipe(null)} selectedRecipe={selectedRecipe} handleViewProfile={handleViewProfile} />
            <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} user={user} uploadData={uploadData} setUploadData={setUploadData} uploadPreview={uploadPreview} setUploadPreview={setUploadPreview} handleSubmitRecipe={handleSubmitRecipe} />
            <ConfirmModal isOpen={isConfirmModalLogOut} onClose={() => setIsConfirmModalLogOut(false)} onConfirm={executeLogout} title="Đăng xuất" message="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?" />
                <ConfirmModal 
            isOpen={isExpiredAlert} 
            onClose={() => setIsExpiredAlert(false)} 
            onConfirm={handleAcceptUpgrade} 
            title="Hết Hạn Gói Premium" 
            message="Gói Premium của bạn đã hết hạn, bạn có muốn mua thêm ngay để tiếp tục sử dụng tính năng VIP không?" 
        />
            <PremiumModal 
            isOpen={isUpgradeModal} 
            onClose={() => setIsUpgradeModal(false)} 
            user={user}
        />
        </div>
    );
};

export default HomePage;