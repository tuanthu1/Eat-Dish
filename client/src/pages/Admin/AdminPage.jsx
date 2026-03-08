import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import './AdminPage.css';
import ConfirmModal from '../../components/modals/ConfirmModal';
import logo2 from '../../logo/logo2.png';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line } from 'recharts';
import RecipeDetailModal from '../../components/modals/RecipeDetailModal';
import PaymentDetailModal from '../../components/modals/PaymentDetailModal';
import AdminPackageModal from '../../components/modals/AdminPackageModal';
import AdminCouponModal from '../../components/modals/AdminCouponModal';
import PackageDetailModal from '../../components/modals/PackageDetailModal';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const AdminPage = () => {
    let navigate = useNavigate();
    
    // State Quản lý 
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
    const [userList, setUserList] = useState([]);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const [userToToggleVIP, setUserToToggleVIP] = useState(null);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [userToToggleVerify, setUserToToggleVerify] = useState(null);
    const [userFilter, setUserFilter] = useState({ search: '', role: 'all', premium: 'all', status: 'all', sortBy: 'newest' });

    const [isMaintenance, setIsMaintenance] = useState(false);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

    // Tổng quan
    const [dashboardMonth, setDashboardMonth] = useState('all'); 
    const [dashboardYear, setDashboardYear] = useState(new Date().getFullYear().toString());
    const [availableYears, setAvailableYears] = useState([new Date().getFullYear()]);

    // State Góp ý
    const [isDeleteFeedbackModalOpen, setIsDeleteFeedbackModalOpen] = useState(false);
    const [feedbackToDelete, setFeedbackToDelete] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [feedbackList, setFeedbackList] = useState([]);
    const [feedbackFilter, setFeedbackFilter] = useState({ search: '', type: 'all', sortBy: 'newest' });
    
    // State Công thức
    const [recipeToDelete, setRecipeToDelete] = useState(null);
    const [stats, setStats] = useState({ users: 0, recipes: 0, posts: 0 }); 
    const [recipes, setRecipes] = useState([]);
    const [recipeFilter, setRecipeFilter] = useState({ search: '', type: 'all', sortBy: 'newest' });
    
    // State Doanh thu
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [payments, setPayments] = useState([]);
    const [paymentFilter, setPaymentFilter] = useState({ search: '', status: 'all', sortBy: 'newest' });

    // State Reset Pass
    const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);
    const [userToReset, setUserToReset] = useState(null);

    // STATE NEWSLETTER (GỬI EMAIL)
    const [newsletterSubject, setNewsletterSubject] = useState('');
    const [newsletterContent, setNewsletterContent] = useState('');
    const [isSendingNewsletter, setIsSendingNewsletter] = useState(false);

    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('admin_current_tab') || 'dashboard');
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedRecipeForDetail, setSelectedRecipeForDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Chart Data
    const [chartData, setChartData] = useState([]);
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [paymentsByStatus, setPaymentsByStatus] = useState([]);
    
    // State Gói Premium
    const [isConfirmAddOpen, setIsConfirmAddOpen] = useState(false);     
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false); 
    const [pkgToDelete, setPkgToDelete] = useState(null);
    const [packages, setPackages] = useState([]); 
    const [isViewPackageModalOpen, setIsViewPackageModalOpen] = useState(false);
    const [pkgToView, setPkgToView] = useState(null);

    // STATE QUẢN LÝ GÓI CƯỚC
    const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false); 
    const [currentPkg, setCurrentPkg] = useState(null);
    const [packageFilter, setPackageFilter] = useState({ search: '', sortBy: 'newest' });
    
    // State Coupon
    const [couponList, setCouponList] = useState([]);
    const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
    const [couponToDelete, setCouponToDelete] = useState(null);
    const [isDeleteCouponModalOpen, setIsDeleteCouponModalOpen] = useState(false);
    const [currentCoupon, setCurrentCoupon] = useState(null); 
    const [isCouponEditMode, setIsCouponEditMode] = useState(false); 
    const [couponFilter, setCouponFilter] = useState({ search: '', status: 'all', sortBy: 'newest' });

    // State Cộng đồng
    const [communityPosts, setCommunityPosts] = useState([]);
    const [postToDelete, setPostToDelete] = useState(null);
    const [isDeletePostModalOpen, setIsDeletePostModalOpen] = useState(false);
    const [postToApprove, setPostToApprove] = useState(null);
    const [isApprovePostModalOpen, setIsApprovePostModalOpen] = useState(false);
    
    // Màu sắc
    const COLORS = ['#ff9f1c', '#ff7675', '#00b894', '#a29bfe'];

    // HÀM MỞ MODAL  
    const openDeleteModal = (recipe) => { setRecipeToDelete(recipe); setIsDeleteModalOpen(true); };
    const openResetPassModal = (user) => { setUserToReset(user); setIsResetPassModalOpen(true); };
    const openDetailModal = (recipe) => { setSelectedRecipeForDetail(recipe); setIsDetailModalOpen(true); };
    const handleTogglePremium = (user) => { setUserToToggleVIP(user); setIsPremiumModalOpen(true); };
    const openAddPackageModal = () => { setCurrentPkg(null); setIsEditMode(false); setIsPackageModalOpen(true); };
    const openEditPackageModal = (pkg) => { setCurrentPkg(pkg); setIsEditMode(true); setIsPackageModalOpen(true); };
    const openAddCouponModal = () => { setCurrentCoupon(null); setIsCouponEditMode(false); setIsCouponModalOpen(true); };
    const openEditCouponModal = (coupon) => { setCurrentCoupon(coupon); setIsCouponEditMode(true); setIsCouponModalOpen(true); };
    const openMaintenanceModal = () => { setIsMaintenanceModalOpen(true); };

    // dành cho điện thoại
    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        setIsMobileSidebarOpen(false); 
    };
    // EFFECTS & DATA LOADING 
    useEffect(() => {
        localStorage.setItem('admin_current_tab', activeTab);
        loadStats(); loadUsers(); loadFeedBacks(); loadPayments(); 
        loadAllRecipes(); loadPackages(); loadCoupons(); loadCommunityPosts();
    }, [activeTab]);

    useEffect(() => {
        const activeUsersCount = userList.filter(u => u.is_verified === 1).length;
        setChartData([
            { name: 'Người dùng', count: activeUsersCount || 0 },
            { name: 'Công thức', count: stats.recipes || 0 },
            { name: 'Mã giảm giá', count: couponList.length || 0 }
        ]);
    }, [stats, couponList.length, userList]);

    useEffect(() => {
        axiosClient.get('/settings/maintenance')
            .then(res => setIsMaintenance(res.data.isMaintenance))
            .catch(err => console.log(err));
    }, []);

    // API CALLS 
    const loadStats = async () => { try { const res = await axiosClient.get(`/admin/stats`); setStats(res.data); } catch (e) {} };
    const loadUsers = async () => { try { const res = await axiosClient.get(`/admin/users`); setUserList(res.data); } catch (e) {} };
    const loadAllRecipes = async () => { try { const res = await axiosClient.get('/admin/recipes'); setRecipes(res.data); } catch (e) {} };
    const loadPayments = async () => { try { const res = await axiosClient.get('/admin/history'); setPayments(res.data); } catch (e) {} };
    const loadPackages = async () => { try { const res = await axiosClient.get('/packages'); setPackages(res.data); } catch (e) {} };
    const loadFeedBacks = async () => { try { const res = await axiosClient.get(`/admin/feedbacks`); setFeedbackList(res.data); } catch (e) {} };
    const loadCoupons = async () => { try { const res = await axiosClient.get(`/admin/coupons`); setCouponList(res.data); } catch (e) {} };
    const loadCommunityPosts = async () => { try { const res = await axiosClient.get(`/admin/community`); setCommunityPosts(res.data); } catch (e) {} };
    
    // Xử lý biểu đồ doanh thu
    useEffect(() => {
        if (!payments || payments.length === 0) { setPaymentsByStatus([]); return; }
        const years = [...new Set(payments.map(p => new Date(p.created_at || p.date).getFullYear()))];
        if (!years.includes(new Date().getFullYear())) years.push(new Date().getFullYear());
        setAvailableYears(years.sort((a, b) => b - a));

        const targetYear = parseInt(dashboardYear);
        const targetMonth = dashboardMonth === 'all' ? 'all' : parseInt(dashboardMonth);
        const statusMap = {};
        let chartDataArr = targetMonth === 'all' 
            ? Array.from({ length: 12 }, (_, i) => ({ name: `Tháng ${i + 1}`, revenue: 0 }))
            : Array.from({ length: new Date(targetYear, targetMonth, 0).getDate() }, (_, i) => ({ name: `Ngày ${i + 1}`, revenue: 0 }));

        payments.forEach(p => {
            const date = new Date(p.created_at || p.date);
            const pYear = date.getFullYear();
            const pMonth = date.getMonth() + 1;
            const pDay = date.getDate();

            if (pYear === targetYear) {
                if (targetMonth === 'all' || pMonth === targetMonth) {
                    const s = p.status || 'unknown';
                    statusMap[s] = (statusMap[s] || 0) + 1;
                }
                const pStatus = (p.status || 'success').toLowerCase();
                const isSuccess = pStatus === 'success' || pStatus === 'paid';

                if (isSuccess) {
                    if (targetMonth === 'all') chartDataArr[pMonth - 1].revenue += Number(p.amount || p.total || 0);
                    else if (pMonth === targetMonth) chartDataArr[pDay - 1].revenue += Number(p.amount || p.total || 0);
                }
            }
        });
        setMonthlyRevenue(chartDataArr);
        setPaymentsByStatus(Object.keys(statusMap).map(k => ({ name: k, count: statusMap[k] })));
    }, [payments, dashboardYear, dashboardMonth]);
    
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => toast.success('Đã sao chép!'))
            .catch(err => console.error('Lỗi sao chép: ', err));
    };

    // HANDLERS 
    const handleSendNewsletter = async () => {
        if (!newsletterSubject.trim() || !newsletterContent.trim()) {
            toast.error(' Vui lòng nhập đầy đủ tiêu đề và nội dung!');
            return;
        }

        if (!window.confirm("Bạn có chắc chắn muốn gửi email này đến TOÀN BỘ người dùng đã đăng ký nhận bản tin không?")) {
            return;
        }

        setIsSendingNewsletter(true);
        try {
            const formattedContent = newsletterContent.replace(/\n/g, '<br>');

            const res = await axiosClient.post('/admin/send-newsletter', {
                subject: newsletterSubject,
                htmlContent: formattedContent 
            });
            
            toast.success(`✅ ${res.data.message}`);
            setNewsletterSubject('');
            setNewsletterContent('');
        } catch (error) {
            toast.error(` Lỗi: ${error.response?.data?.message || 'Không thể gửi email lúc này'}`);
        } finally {
            setIsSendingNewsletter(false);
        }
    };

    const executeToggleMaintenance = async () => {
        try {
            const res = await axiosClient.post('/settings/maintenance/toggle', { status: !isMaintenance });
            setIsMaintenance(!isMaintenance);
            setIsMaintenanceModalOpen(false); 
            toast.success(res.data.message); 
        } catch (error) {
            toast.error("Lỗi khi thay đổi trạng thái bảo trì!");
            setIsMaintenanceModalOpen(false);
        }
    };
    const confirmDeleteRecipe = async() => {
        if(!recipeToDelete) return;
        try { await axiosClient.delete(`/admin/recipes/${recipeToDelete.id}`); toast.success(`Đã xóa: ${recipeToDelete.name}`); loadAllRecipes(); } 
        catch(e) { toast.error("Lỗi xóa công thức."); }
    }
    const confirmDeletePost = async () => {
        if (!postToDelete) return;
        try { await axiosClient.delete(`/admin/community/${postToDelete.id}`); toast.success("Đã xóa bài viết."); setIsDeletePostModalOpen(false); loadCommunityPosts(); } 
        catch (e) { toast.error("Lỗi xóa bài viết."); }
    };
    const confirmApprovePost = async () => {
        if (!postToApprove) return;
        try { await axiosClient.put(`/admin/community/${postToApprove.id}/approve`); toast.success("Đã duyệt."); setIsApprovePostModalOpen(false); loadCommunityPosts(); } 
        catch (e) { toast.error("Lỗi duyệt bài."); }
    };
    const confirmDeleteUser = async () => {
        if (!userToDelete) return;
        try { await axiosClient.delete(`/users/${userToDelete.id}`); toast.success(`Đã xóa: ${userToDelete.fullname}`); loadUsers(); } 
        catch (e) { toast.error("Lỗi xóa tài khoản."); }
    };
    const confirmToggleVerify = async () => {
        if (!userToToggleVerify) return;
        const newStatus = userToToggleVerify.is_verified === 1 ? 0 : 1;
        try {
            await axiosClient.put(`/admin/users/${userToToggleVerify.id}/verify`, { is_verified: newStatus });
            setUserList(prev => prev.map(u => u.id === userToToggleVerify.id ? { ...u, is_verified: newStatus } : u));
            setIsVerifyModalOpen(false);
            toast.success(newStatus === 1 ? "Đã kích hoạt! ✅" : "Đã khóa! 🔒");
        } catch (err) { toast.error("Lỗi cập nhật trạng thái!"); }
    };
    const confirmResetPass = async () => {
        if (!userToReset) return;
        try { await axiosClient.put(`/admin/reset/${userToReset.id}`, { password: "123456" }); toast.success(`Reset mật khẩu thành: 123456`); } 
        catch (e) { toast.error("Lỗi reset mật khẩu."); }
    };
    const confirmDeleteFeedback = async () => {
        if (!feedbackToDelete) return;
        try { await axiosClient.delete(`/admin/feedbacks/${feedbackToDelete.id}`); toast.success("Đã xóa góp ý."); loadFeedBacks(); } 
        catch (e) { toast.error("Lỗi xóa góp ý."); }
    };
    const confirmTogglePremium = async () => {
        if (!userToToggleVIP) return;
        const newStatus = userToToggleVIP.is_premium === 1 ? 0 : 1;
        try {
            await axiosClient.put(`/admin/${userToToggleVIP.id}/premium`, { is_premium: newStatus });
            setUserList(prev => prev.map(u => u.id === userToToggleVIP.id ? { ...u, is_premium: newStatus } : u));
            setIsPremiumModalOpen(false); setUserToToggleVIP(null);
            toast.success(newStatus === 1 ? "Đã cấp VIP! 👑" : "Đã hủy VIP!");
        } catch (err) { toast.error("Lỗi cập nhật VIP!"); }
    };
    const toggleRecipeVIP = async (recipe) => {
        const newStatus = recipe.is_premium === 1 ? 0 : 1;
        try {
            await axiosClient.put(`/admin/recipes/${recipe.id}/premium`, { is_premium: newStatus });
            setRecipes(prev => prev.map(r => r.id === recipe.id ? { ...r, is_premium: newStatus } : r));
            toast.success("Cập nhật trạng thái VIP thành công!");
        } catch (err) { toast.error("Lỗi cập nhật trạng thái VIP"); }
    };
    const confirmAddPackage = async () => {
        try { await axiosClient.post('/admin/packages', { name: 'Gói mới', price: 0, duration_days: 30, description: '' }); toast.success("Đã thêm gói!"); setIsPackageModalOpen(false); loadPackages(); } 
        catch (err) { toast.error("Lỗi thêm gói"); }
    };
    const confirmDeletePackage = async () => {
        if (!pkgToDelete) return;
        try { await axiosClient.delete(`/admin/packages/${pkgToDelete.id}`); toast.success("Đã xóa gói"); loadPackages(); setIsConfirmDeleteOpen(false); } 
        catch(e) { toast.error("Lỗi xóa gói"); }
    };
    const openRecipeDetails = async (recipeOrId) => {
        const id = recipeOrId?.id ?? recipeOrId;
        if (!id) return;
        try { setIsLoading(true); const res = await axiosClient.get(`/recipes/${id}`); setSelectedRecipeForDetail(res.data); setIsDetailModalOpen(true); } 
        catch (e) { toast.error('Lỗi tải chi tiết.'); } finally { setIsLoading(false); }
    };
    const handleSavePackage = async (formData) => {
        try {
            if (isEditMode && currentPkg) { await axiosClient.put(`/admin/packages/${currentPkg.id}`, formData); toast.success("Đã cập nhật!"); } 
            else { await axiosClient.post('/admin/packages', formData); toast.success("Đã thêm gói!"); }
            setIsPackageModalOpen(false); loadPackages();
        } catch (err) { toast.error("Lỗi lưu gói cước!"); }
    };
    const handleSaveCoupon = async (formData) => {
        try {
            if (isCouponEditMode && currentCoupon) { await axiosClient.put(`/admin/coupons/${currentCoupon.id}`, formData); toast.success("Đã cập nhật!"); } 
            else { await axiosClient.post('/admin/coupons', formData); toast.success("Đã tạo mã!"); }
            setIsCouponModalOpen(false); loadCoupons();
        } catch (e) { toast.error(e.response?.data?.message || "Lỗi tạo mã"); }
    };
    const handleDeleteCoupon = async () => {
        if (!couponToDelete) return;
        try { await axiosClient.delete(`/admin/coupons/${couponToDelete.id}`); toast.success("Đã xóa mã"); loadCoupons(); setIsDeleteCouponModalOpen(false); } 
        catch (e) { toast.error("Lỗi xóa mã"); }
    };
    const handleToggleCouponStatus = async (coupon) => {
        try {
            await axiosClient.put(`/admin/coupons/${coupon.id}/status`);
            setCouponList(prevList => prevList.map(c => c.id === coupon.id ? { ...c, is_active: !c.is_active } : c));
            toast.success(`Đã ${coupon.is_active ? 'tắt' : 'bật'} mã ${coupon.code}`);
        } catch (e) { toast.error("Lỗi trạng thái!"); }
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
    
    // XUẤT EXCEL
    const handleExportExcel = (data, fileName) => {
        if (!data || data.length === 0) { toast.error("Không có dữ liệu để xuất!"); return; }
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
        toast.success(`Đã xuất ${fileName}.xlsx!`);
    };
    const exportUsersToExcel = () => {
        const formattedData = userList.map(u => ({ 'ID': u.id, 'Họ Tên': u.fullname, 'Username': u.username, 'Email': u.email, 'Vai trò': u.role === 'admin' ? 'Admin' : 'User', 'VIP': u.is_premium === 1 ? 'Có' : 'Không', 'Trạng thái': u.is_verified === 1 ? 'Hoạt động' : 'Bị khóa' }));
        handleExportExcel(formattedData, 'Danh_Sach_Users');
    };
    const exportRecipesToExcel = () => {
        const formattedData = recipes.map(r => ({ 'ID': r.id, 'Tên món': r.title, 'Tác giả': r.author_name, 'Loại': r.is_premium === 1 ? 'Premium' : 'Free', 'Ngày đăng': new Date(r.created_at).toLocaleString('vi-VN') }));
        handleExportExcel(formattedData, 'Danh_Sach_Mon_An');
    };
    const exportBillingToExcel = () => {
        const formattedData = payments.map(p => ({ 'Mã GD': p.order_id, 'Khách hàng': p.fullname || p.username, 'Email': p.email, 'Số tiền': p.amount || p.total || 0, 'Phương thức': p.method || 'PayOS', 'Trạng thái': (p.status || '').toUpperCase(), 'Ngày GD': new Date(p.created_at || p.date).toLocaleString('vi-VN') }));
        handleExportExcel(formattedData, 'Lich_Su_Giao_Dich');
    };

    if (isLoading && !selectedRecipeForDetail) return <div className="loading-state">Đang tải dữ liệu...</div>;

    return (
        <div className='admin-container'>
            {/* SIDEBAR */}
            <div 
                className={`sidebar-overlay ${isMobileSidebarOpen ? 'active' : ''}`} 
                onClick={() => setIsMobileSidebarOpen(false)}
            ></div>

            {/* 2. SIDEBAR CHÍNH (CHỈ 1 LỚP DUY NHẤT) */}
            <div className={`admin-sidebar ${isMobileSidebarOpen ? 'show-mobile' : ''}`}>
                <header className="admin-logo">
                    <img src={logo2} alt="EatDish Admin" style={{ width: '60px', height: '60px', borderRadius: '15px', objectFit: 'cover' }} />
                    <div className="logo-text">ADMIN<br /><span className="logo-highlight">EATDISH</span></div>
                </header>

                <div className={`admin-menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => handleTabClick('dashboard')}><span className="menu-icon">📊</span><span>Tổng Quan</span></div>
                <div className={`admin-menu-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => handleTabClick('users')}><span className="menu-icon">👥</span><span>Người Dùng</span></div>
                <div className={`admin-menu-item ${activeTab === 'recipes' ? 'active' : ''}`} onClick={() => handleTabClick('recipes')}><span className="menu-icon">🍲</span><span>Món Ăn</span></div>
                <div className={`admin-menu-item ${activeTab === 'billing' ? 'active' : ''}`} onClick={() => handleTabClick('billing')}><span className="menu-icon">💰</span><span>Doanh Thu</span></div>
                <div className={`admin-menu-item ${activeTab === 'community' ? 'active' : ''}`} onClick={() => handleTabClick('community')}><span className="menu-icon">💬</span><span>Cộng Đồng</span></div>
                <div className={`admin-menu-item ${activeTab === 'packages' ? 'active' : ''}`} onClick={() => handleTabClick('packages')}><span className="menu-icon">💎</span><span>Gói Premium</span></div>
                <div className={`admin-menu-item ${activeTab === 'coupons' ? 'active' : ''}`} onClick={() => handleTabClick('coupons')}><span className="menu-icon">🎟️</span><span>Mã Giảm Giá</span></div>
                <div className={`admin-menu-item ${activeTab === 'feedbacks' ? 'active' : ''}`} onClick={() => handleTabClick('feedbacks')}><span className="menu-icon">📭</span><span>Góp Ý</span></div>
                <div className={`admin-menu-item ${activeTab === 'newsletter' ? 'active' : ''}`} onClick={() => handleTabClick('newsletter')}><span className="menu-icon">📧</span><span>Gửi Email</span></div>
                
                <div className='admin-menu-item btn-home' onClick={() => navigate('/')}><span className="menu-icon">🚪</span><span>Rời trang</span></div>
            </div>

            {/* MAIN CONTENT */}
            <div className='admin-content'>
                
                {/* DASHBOARD */}
                {activeTab === 'dashboard' && (
                    <div className='fadeIn'>
                        <div className="admin-header-row">
                            <div className="header-mobile-wrapper">
                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    <button className="mobile-menu-toggle" onClick={() => setIsMobileSidebarOpen(true)}>☰</button>
                                    <h1 className='page-title' style={{margin: 0}}>Tổng quan hệ thống</h1>
                                </div>
                            </div>
                                    <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '15px', marginTop: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <span>Chế độ bảo trì: <strong style={{color: isMaintenance ? '#e74c3c' : '#2ecc71'}}>{isMaintenance ? 'ĐANG BẬT (Khách bị chặn)' : 'BÌNH THƯỜNG'}</strong></span>
                                            <button 
                                                onClick={openMaintenanceModal} 
                                                style={{
                                                    backgroundColor: isMaintenance ? '#e74c3c' : '#2ecc71',
                                                    color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                                                }}
                                            >
                                                {isMaintenance ? 'Tắt Bảo Trì' : 'Bật Bảo Trì'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="dashboard-date-filter">
                                        <span className="dashboard-date-label">📅 Xem:</span>
                                        <select value={dashboardMonth} onChange={(e) => setDashboardMonth(e.target.value)} className="dashboard-date-select">
                                            <option value="all">Cả năm</option>
                                            {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>)}
                                        </select>
                                        <select value={dashboardYear} onChange={(e) => setDashboardYear(e.target.value)} className="dashboard-date-select">
                                            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                        </div>

                        <div className='dashboard-grid'>
                            <Card title="USER ĐANG HOẠT ĐỘNG" value={userList.filter(u => u.is_verified === 1).length || 0} color="#0984e3" icon="👤" />
                            <Card title="TỔNG MÓN ĂN" value={stats.recipes || 0} color="#00b894" icon="🍲" />
                            <Card title={dashboardMonth === 'all' ? `DOANH THU NĂM ${dashboardYear}` : `DOANH THU THÁNG ${dashboardMonth}`} value={formatCurrency(monthlyRevenue.reduce((acc, curr) => acc + curr.revenue, 0))} color="#ff9f1c" icon="💰" />
                        </div>
                        
                        <div className="admin-chart-box" style={{ marginTop: '20px' }}>
                            <h3 className="admin-chart-box-title">Thống kê chung</h3>
                            <div style={{ width: '100%', height: '350px' }}>
                                {Array.isArray(chartData) && chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                            <YAxis axisLine={false} tickLine={false} />
                                            <Tooltip cursor={{fill: '#f9fafc'}} contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)'}} />
                                            <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={60}>
                                                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="admin-empty-table" style={{paddingTop: '150px'}}>Đang tải dữ liệu...</div>
                                )}
                            </div>
                        </div>

                        <div className="admin-chart-grid">
                            <div className="admin-chart-box">
                                <h3 className="admin-chart-box-title">Trạng thái giao dịch {dashboardMonth !== 'all' ? `(Tháng ${dashboardMonth})` : `(${dashboardYear})`}</h3>
                                <div style={{ width: '100%', height: '250px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={paymentsByStatus} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                                {paymentsByStatus.map((entry, index) => <Cell key={`status-pie-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip /><Legend verticalAlign="bottom" height={36}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="admin-chart-box">
                                <h3 className="admin-chart-box-title">Biểu đồ doanh thu {dashboardMonth !== 'all' ? `(Tháng ${dashboardMonth})` : `(${dashboardYear})`}</h3>
                                <div style={{ width: '100%', height: '250px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={monthlyRevenue}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                            <YAxis tickFormatter={(value) => `${value/1000}k`} axisLine={false} tickLine={false} />
                                            <Tooltip formatter={(value) => formatCurrency(value)} />
                                            <Line type="monotone" dataKey="revenue" stroke="#ff9f1c" strokeWidth={4} dot={{ r: 4, fill: '#ff9f1c', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                        
                        <div className="admin-chart-box" style={{ marginBottom: '25px', marginTop: '25px' }}>
                            <h3 className="admin-chart-box-title">📊 Top Mã Được Sử Dụng Nhiều Nhất</h3>
                            <div style={{ width: '100%', height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={couponList.map(c => ({ name: c.code, count: c.used_count || 0 }))}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{fill: '#f9fafc'}} contentStyle={{borderRadius: '10px', border: 'none'}} />
                                        <Bar dataKey="count" name="Lượt dùng" fill="#00b894" radius={[10, 10, 0, 0]} barSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* USERS */}
                {activeTab === 'users' && (
                    <div className='fadeIn'>
                        <div className="admin-header-row">
                            <div className="header-mobile-wrapper">
                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    <button className="mobile-menu-toggle" onClick={() => setIsMobileSidebarOpen(true)}>☰</button>
                                    <h1 className='page-title' style={{margin: 0}}>Quản lý người dùng ({userList.length})</h1>
                                </div>
                            </div>
                            <button onClick={exportUsersToExcel} className="btn-primary-admin">Xuất Excel</button>
                        </div>
                        <div className="admin-filter-row">
                            <div className="admin-search-wrapper">
                                <input type="text" placeholder="Tìm tên, username, email..." value={userFilter.search} onChange={(e) => setUserFilter(prev => ({ ...prev, search: e.target.value }))} className="admin-search-input" />
                                <span className="admin-search-icon">🔍</span>
                            </div>
                            <select value={userFilter.premium} onChange={(e) => setUserFilter(prev => ({ ...prev, premium: e.target.value }))} className="admin-filter-select">
                                <option value="all">Tất cả gói</option><option value="premium">VIP</option><option value="free">Free</option>
                            </select>
                            <select value={userFilter.status} onChange={(e) => setUserFilter(prev => ({ ...prev, status: e.target.value }))} className="admin-filter-select">
                                <option value="all">Tất cả trạng thái</option><option value="active">Đang hoạt động</option><option value="locked">Bị khóa</option>
                            </select>
                            <select value={userFilter.sortBy} onChange={(e) => setUserFilter(prev => ({ ...prev, sortBy: e.target.value }))} className="admin-filter-select">
                                <option value="newest">Mới nhất</option><option value="oldest">Cũ nhất</option><option value="name_asc">A-Z Tên</option><option value="name_desc">Z-A Tên</option>
                            </select>
                        </div>

                        <div className='table-container'>
                            <table className="admin-table">
                                <thead><tr><th>Người dùng</th><th>Email / Username</th><th>Vai trò</th><th>Gói Premium</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
                                <tbody>
                                    {userList
                                        .filter(u => {
                                            const kw = userFilter.search.toLowerCase();
                                            const match = (u.fullname?.toLowerCase().includes(kw)) || (u.username?.toLowerCase().includes(kw)) || (u.email?.toLowerCase().includes(kw));
                                            const rMatch = userFilter.role === 'all' ? true : (userFilter.role === 'admin' ? u.role === 'admin' : u.role !== 'admin');
                                            const pMatch = userFilter.premium === 'all' ? true : (userFilter.premium === 'premium' ? u.is_premium === 1 : (u.is_premium === 0 || !u.is_premium));
                                            const sMatch = userFilter.status === 'all' ? true : (userFilter.status === 'active' ? u.is_verified === 1 : u.is_verified !== 1);
                                            return match && rMatch && pMatch && sMatch;
                                        })
                                        .sort((a, b) => {
                                            if (userFilter.sortBy === 'name_asc') return (a.fullname || '').localeCompare(b.fullname || '');
                                            if (userFilter.sortBy === 'name_desc') return (b.fullname || '').localeCompare(a.fullname || '');
                                            return userFilter.sortBy === 'oldest' ? a.id - b.id : b.id - a.id; 
                                        })
                                        .map(u => (
                                            <tr key={u.id}>
                                                <td>
                                                    <div className="admin-flex-align-center">
                                                        <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.fullname}&background=random`} className="admin-avatar-sm" alt="" />
                                                        <span className="admin-text-bold">{u.fullname}</span>
                                                    </div>
                                                </td>
                                                <td>{u.email} <br/><small className="admin-text-muted">@{u.username || 'user'}</small></td>
                                                <td><span className={`admin-badge ${u.role === 'admin' ? 'warning' : 'secondary'}`}>{u.role ? u.role.toUpperCase() : 'USER'}</span></td>
                                                <td><span className={`admin-badge ${u.is_premium === 1 ? 'vip' : 'free'}`}>{u.is_premium === 1 ? '👑 VIP' : 'Free'}</span></td>
                                                <td><span className={`admin-badge ${u.is_verified === 1 ? 'success' : 'danger'}`}>{u.is_verified === 1 ? '• Active' : '• Locked'}</span></td>
                                                <td>
                                                    {u.role !== 'admin' && (
                                                        <div className="admin-action-row">
                                                            <button onClick={() => {setUserToDelete(u); setIsDeleteUserModalOpen(true);}} className="btn btn-delete" title="Xóa">🗑️</button>
                                                            <button onClick={() => openResetPassModal(u)} className="btn btn-secondary" title="Reset MK">🔑</button>
                                                            <button onClick={() => handleTogglePremium(u)} className={`btn ${u.is_premium === 1 ? 'btn-danger' : 'btn-warning'}`} title="VIP">{u.is_premium === 1 ? '⇩' : '👑'}</button>
                                                            <button onClick={() => { setUserToToggleVerify(u); setIsVerifyModalOpen(true); }} className={`btn ${u.is_verified === 1 ? 'btn-secondary' : 'btn-success'}`} title="Khóa">{u.is_verified === 1 ? '🔒' : '🔓'}</button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* RECIPES */}
                {activeTab === 'recipes' && (
                    <div className="fadeIn">
                        <div className="admin-header-row">
                            <div className="header-mobile-wrapper">
                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    <button className="mobile-menu-toggle" onClick={() => setIsMobileSidebarOpen(true)}>☰</button>
                                    <h1 className='page-title' style={{margin: 0}}>Quản lý Món Ăn ({recipes.length})</h1>
                                </div>
                            </div>
                            <button onClick={exportRecipesToExcel} className="btn-primary-admin">Xuất Excel</button>
                        </div>
                        <div className="admin-filter-row">
                            <div className="admin-search-wrapper">
                                <input type="text" placeholder="Tìm tên món, tác giả..." value={recipeFilter.search} onChange={(e) => setRecipeFilter(prev => ({ ...prev, search: e.target.value }))} className="admin-search-input" />
                                <span className="admin-search-icon">🔍</span>
                            </div>
                            <select value={recipeFilter.type} onChange={(e) => setRecipeFilter(prev => ({ ...prev, type: e.target.value }))} className="admin-filter-select">
                                <option value="all">Tất cả thể loại</option><option value="free">Miễn phí</option><option value="premium">Premium</option>
                            </select>
                            <select value={recipeFilter.sortBy} onChange={(e) => setRecipeFilter(prev => ({ ...prev, sortBy: e.target.value }))} className="admin-filter-select">
                                <option value="newest">Mới nhất</option><option value="oldest">Cũ nhất</option><option value="name_asc">A-Z</option><option value="name_desc">Z-A</option>
                            </select>
                        </div>

                        <div className="table-container">
                            <table className="admin-table">
                                <thead><tr><th>Món ăn</th><th>Tác giả</th><th>Ngày đăng</th><th>Loại</th><th>Hành động</th></tr></thead>
                                <tbody>
                                    {recipes
                                        .filter(r => {
                                            const kw = recipeFilter.search.toLowerCase();
                                            const match = (r.title?.toLowerCase().includes(kw)) || (r.author_name?.toLowerCase().includes(kw));
                                            let tMatch = true;
                                            if (recipeFilter.type === 'free') tMatch = r.is_premium === 0 || !r.is_premium;
                                            if (recipeFilter.type === 'premium') tMatch = r.is_premium === 1;
                                            return match && tMatch;
                                        })
                                        .sort((a, b) => {
                                            if (recipeFilter.sortBy === 'name_asc') return (a.title || '').localeCompare(b.title || '');
                                            if (recipeFilter.sortBy === 'name_desc') return (b.title || '').localeCompare(a.title || '');
                                            return recipeFilter.sortBy === 'newest' ? new Date(b.created_at) - new Date(a.created_at) : new Date(a.created_at) - new Date(b.created_at);
                                        })
                                        .map((r) => (
                                            <tr key={r.id}>
                                                <td>
                                                    <div className="admin-flex-align-center">
                                                        <img src={r.image_url} alt="" className="admin-avatar-recipe" />
                                                        <span className="admin-text-bold">{r.title}</span>
                                                    </div>
                                                </td>
                                                <td><span onClick={() => navigate(`/profile/${r.author_id}`)} className="admin-text-primary admin-pointer">@{r.author_name}</span></td>
                                                <td className="admin-text-muted">{new Date(r.created_at).toLocaleDateString('vi-VN')}</td>
                                                <td><span className={`admin-badge ${r.is_premium === 1 ? 'vip' : 'free'}`}>{r.is_premium === 1 ? '👑 PREMIUM' : 'Free'}</span></td>
                                                <td>
                                                    <div className="admin-action-row">
                                                        <button onClick={() => openRecipeDetails(r)} className="btn btn-outline">Xem</button>
                                                        <button onClick={() => toggleRecipeVIP(r)} className={`btn ${r.is_premium ? 'btn-danger' : 'btn-warning'}`}>{r.is_premium ? 'Hủy VIP' : 'Set VIP'}</button>
                                                        <button onClick={() => openDeleteModal(r)} className="btn btn-delete">Xóa</button>
                                                    </div>
                                                </td>
                                            </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB CỘNG ĐỒNG */}
                {activeTab === 'community' && (
                    <div className="fadeIn">
                        <div className="admin-header-row">
                            <div className="header-mobile-wrapper">
                                <button className="mobile-menu-toggle" onClick={() => setIsMobileSidebarOpen(true)}>☰</button>
                                <h1 className='page-title' style={{margin: 0}}>Quản lý Cộng Đồng ({communityPosts.length})</h1>
                            </div>
                        </div>
                        <div className="table-container">
                            <table className="admin-table">
                                <thead><tr><th>Tác giả</th><th>Nội dung</th><th>Ảnh đính kèm</th><th>Ngày đăng</th><th>Hành động</th></tr></thead>
                                <tbody>
                                    {communityPosts.length > 0 ? communityPosts.map((post) => (
                                        <tr key={post.id}>
                                            <td>
                                                <div className="admin-flex-align-center">
                                                    <img src={post.avatar || `https://ui-avatars.com/api/?name=${post.fullname}`} alt="" className="admin-avatar-sm" />
                                                    <span className="admin-text-bold">{post.fullname || post.username}</span>
                                                </div>
                                            </td>
                                            <td><div className="admin-text-truncate">{post.content}</div></td>
                                            <td>{post.image_url ? <img src={post.image_url} alt="img" className="admin-avatar-recipe" /> : <span className="admin-text-muted">Không ảnh</span>}</td>
                                            <td className="admin-text-muted">{new Date(post.created_at).toLocaleDateString('vi-VN')}</td>
                                            <td><button onClick={() => { setPostToDelete(post); setIsDeletePostModalOpen(true); }} className="btn btn-delete">Xóa</button></td>
                                        </tr>
                                    )) : <tr><td colSpan="5" className="admin-empty-table">Chưa có bài đăng nào.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* BILLING */}
                {activeTab === 'billing' && (
                    <div className="fadeIn">
                        <div className="admin-header-row">
                            <div className="header-mobile-wrapper">
                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    <button className="mobile-menu-toggle" onClick={() => setIsMobileSidebarOpen(true)}>☰</button>
                                    <h1 className="page-title" style={{margin: 0}}>Lịch sử giao dịch</h1>
                                </div>
                            </div>
                            <button onClick={exportBillingToExcel} className="btn-primary-admin">Xuất Excel</button>
                        </div>
                        <div className="admin-filter-row">
                            <div className="admin-search-wrapper">
                                <input type="text" placeholder="Tìm mã GD, tên, email..." value={paymentFilter.search} onChange={(e) => setPaymentFilter(prev => ({ ...prev, search: e.target.value }))} className="admin-search-input" />
                                <span className="admin-search-icon">🔍</span>
                            </div>
                            <select value={paymentFilter.status} onChange={(e) => setPaymentFilter(prev => ({ ...prev, status: e.target.value }))} className="admin-filter-select">
                                <option value="all">Tất cả trạng thái</option><option value="success">Thành công</option><option value="pending">Đang chờ</option><option value="refunded">Hoàn tiền/Thất bại</option>
                            </select>
                            <select value={paymentFilter.sortBy} onChange={(e) => setPaymentFilter(prev => ({ ...prev, sortBy: e.target.value }))} className="admin-filter-select">
                                <option value="newest">Mới nhất</option><option value="oldest">Cũ nhất</option><option value="amount_desc">Tiền (Cao ➔ Thấp)</option><option value="amount_asc">Tiền (Thấp ➔ Cao)</option>
                            </select>
                        </div>

                        <div className="table-container">
                            <table className="admin-table">
                                <thead><tr><th>Mã GD</th><th>Khách hàng</th><th>Số tiền</th><th>Phương thức</th><th>Trạng thái</th><th>Ngày tạo</th><th>Chi tiết</th></tr></thead>
                                <tbody>
                                    {payments
                                        .filter(p => {
                                            const kw = paymentFilter.search.toLowerCase();
                                            const match = (p.order_id?.toString().includes(kw)) || (p.fullname?.toLowerCase().includes(kw)) || (p.email?.toLowerCase().includes(kw));
                                            const st = (p.status || 'success').toLowerCase();
                                            let sMatch = true;
                                            if (paymentFilter.status === 'success') sMatch = st === 'success' || st === 'paid';
                                            else if (paymentFilter.status === 'pending') sMatch = st === 'pending';
                                            else if (paymentFilter.status === 'refunded') sMatch = st === 'refunded' || st === 'failed';
                                            return match && sMatch;
                                        })
                                        .sort((a, b) => {
                                            if (paymentFilter.sortBy === 'amount_desc') return (Number(b.amount || b.total || 0)) - (Number(a.amount || a.total || 0));
                                            if (paymentFilter.sortBy === 'amount_asc') return (Number(a.amount || a.total || 0)) - (Number(b.amount || b.total || 0));
                                            return paymentFilter.sortBy === 'newest' ? new Date(b.created_at || b.date) - new Date(a.created_at || a.date) : new Date(a.created_at || a.date) - new Date(b.created_at || b.date);
                                        })
                                        .map((p) => {
                                            const pStatus = (p.status || 'success').toLowerCase();
                                            const isSuccess = pStatus === 'success' || pStatus === 'paid';
                                            return (
                                                <tr key={p.order_id || Math.random()}>
                                                    <td>#{p.order_id}</td>
                                                    <td><b>{p.fullname || p.username}</b><br/><small className="admin-text-muted">{p.email}</small></td>
                                                    <td className="admin-text-primary">{formatCurrency(p.amount || p.total || 0)}</td>
                                                    <td>{p.method || 'PayOS'}</td>
                                                    <td><span className={`admin-badge ${isSuccess ? 'success' : (pStatus === 'pending' ? 'warning' : 'danger')}`}>{p.status ? p.status.toUpperCase() : 'SUCCESS'}</span></td>
                                                    <td>{formatDate(p.created_at || p.date)}</td>
                                                    <td><button onClick={() => { setSelectedPayment(p); setIsPaymentModalOpen(true); }} className="btn btn-secondary">Xem</button></td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                {/* PACKAGES */}
                {activeTab === 'packages' && (
                    <div className="fadeIn">
                        <div className="admin-header-row">
                            <div className="header-mobile-wrapper">
                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    <button className="mobile-menu-toggle" onClick={() => setIsMobileSidebarOpen(true)}>☰</button>
                                    <h1 className="page-title" style={{margin: 0}}>Gói Premium</h1>
                                </div>
                            </div>
                            <button onClick={openAddPackageModal} className="btn-primary-admin">+ Thêm Gói</button>
                        </div>
                        <div className="admin-filter-row">
                            <div className="admin-search-wrapper">
                                <input type="text" placeholder="Tìm gói..." value={packageFilter.search} onChange={(e) => setPackageFilter(prev => ({ ...prev, search: e.target.value }))} className="admin-search-input" />
                                <span className="admin-search-icon">🔍</span>
                            </div>
                            <select value={packageFilter.sortBy} onChange={(e) => setPackageFilter(prev => ({ ...prev, sortBy: e.target.value }))} className="admin-filter-select">
                                <option value="newest">Mới nhất</option><option value="price_desc">Giá (Cao ➔ Thấp)</option><option value="price_asc">Giá (Thấp ➔ Cao)</option>
                            </select>
                        </div>

                        <div className="package-grid">
                            {packages
                                .filter(pkg => (pkg.name?.toLowerCase().includes(packageFilter.search.toLowerCase())) || (pkg.description?.toLowerCase().includes(packageFilter.search.toLowerCase())))
                                .sort((a, b) => {
                                    if (packageFilter.sortBy === 'price_desc') return b.price - a.price;
                                    if (packageFilter.sortBy === 'price_asc') return a.price - b.price;
                                    return b.id - a.id; 
                                })
                                .map(pkg => (
                                <div 
                                    key={pkg.id} 
                                    className="package-card" 
                                    onClick={() => { setPkgToView(pkg); setIsViewPackageModalOpen(true); }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="admin-action-row" style={{ position: 'absolute', top: 15, right: 15 }}>
                                        <button onClick={(e) => { e.stopPropagation(); openEditPackageModal(pkg); }} className="btn-icon btn-secondary" title="Sửa">✏️</button>
                                        <button onClick={(e) => { e.stopPropagation(); setPkgToDelete(pkg); setIsConfirmDeleteOpen(true); }} className="btn-icon btn-danger" title="Xóa">🗑️</button>
                                    </div>
                                    <div className="pkg-icon-box">{pkg.duration_days >= 365 ? '👑' : '💎'}</div>
                                    <h3>{pkg.name}</h3>
                                    <div className="pkg-price">{formatCurrency(pkg.price)}</div>
                                    <span className="pkg-duration">{pkg.duration_days} ngày</span>
                                    <p className="pkg-desc">{pkg.description}</p> 
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* COUPON  */}
                {activeTab === 'coupons' && (
                    <div className="fadeIn">
                        <div className="admin-header-row">
                            <div className="header-mobile-wrapper">
                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    <button className="mobile-menu-toggle" onClick={() => setIsMobileSidebarOpen(true)}>☰</button>
                                    <h1 className="page-title" style={{margin: 0}}>Quản lý Mã Giảm Giá</h1>
                                </div>
                            </div>
                            <button onClick={openAddCouponModal} className="btn-primary-admin">+ Tạo Mã</button>
                        </div>
                        <div className="admin-filter-row">
                            <div className="admin-search-wrapper">
                                <input type="text" placeholder="Tìm theo mã code..." value={couponFilter.search} onChange={(e) => setCouponFilter(prev => ({ ...prev, search: e.target.value }))} className="admin-search-input" />
                                <span className="admin-search-icon">🔍</span>
                            </div>
                            <select value={couponFilter.status} onChange={(e) => setCouponFilter(prev => ({ ...prev, status: e.target.value }))} className="admin-filter-select">
                                <option value="all">Tất cả trạng thái</option><option value="active">🟢 Đang hoạt động</option><option value="inactive">⚫ Đang tắt</option>
                            </select>
                            <select value={couponFilter.sortBy} onChange={(e) => setCouponFilter(prev => ({ ...prev, sortBy: e.target.value }))} className="admin-filter-select">
                                <option value="newest">Mới nhất</option><option value="used_desc">Lượt dùng (Cao ➔ Thấp)</option><option value="percent_desc">Giảm giá (Cao ➔ Thấp)</option>
                            </select>
                        </div>

                        <div className="table-container">
                            <table className="admin-table">
                                <thead><tr><th>Mã Code</th><th>Giảm (%)</th><th>Đã dùng</th><th>Trạng thái</th><th>Hết hạn</th><th>Hành động</th></tr></thead>
                                <tbody>
                                    {couponList
                                        .filter(c => c.code.toLowerCase().includes(couponFilter.search.toLowerCase()) && (couponFilter.status === 'all' || (couponFilter.status === 'active' ? c.is_active : !c.is_active)))
                                        .sort((a, b) => {
                                            if (couponFilter.sortBy === 'used_desc') return (b.used_count || 0) - (a.used_count || 0);
                                            if (couponFilter.sortBy === 'percent_desc') return b.percent - a.percent;
                                            return b.id - a.id; 
                                        })
                                        .map(c => (
                                        <tr key={c.id}>
                                            <td><span onClick={() => copyToClipboard(`${c.code}`)} className="coupon-code-badge">{c.code}</span></td>
                                            <td className="admin-text-danger">-{c.percent}%</td>
                                            <td><b>{c.used_count || 0}</b> <span className="admin-text-muted">lượt</span></td>
                                            <td><span onClick={() => handleToggleCouponStatus(c)} className={`admin-badge ${c.is_active ? 'solid-success' : 'solid-secondary'} admin-pointer`}>{c.is_active ? '🟢 Đang bật' : '⚫ Đã tắt'}</span></td>
                                            <td>{c.expiry_date ? formatDate(c.expiry_date).split(' ')[1] : 'Vô thời hạn'}</td>
                                            <td>
                                                <div className="admin-action-row">
                                                    <button onClick={() => openEditCouponModal(c)} className="btn btn-secondary">✏️</button>
                                                    <button onClick={() => { setCouponToDelete(c); setIsDeleteCouponModalOpen(true); }} className="btn btn-delete">Xóa</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* FEEDBACKS */}
                {activeTab === 'feedbacks' && (
                    <div className='fadeIn'>
                        <div className="admin-header-row">
                            <div className="header-mobile-wrapper">
                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    <button className="mobile-menu-toggle" onClick={() => setIsMobileSidebarOpen(true)}>☰</button>
                                    <h1 className='page-title'>Góp ý từ người dùng</h1>
                                </div>
                            </div>
                        </div>
                            <div className="admin-filter-row" >
                                <div className="admin-search-wrapper">
                                    <input type="text" placeholder="Tìm tên, email..." value={feedbackFilter.search} onChange={(e) => setFeedbackFilter(prev => ({ ...prev, search: e.target.value }))} className="admin-search-input" />
                                    <span className="admin-search-icon">🔍</span>
                                </div>
                                <select value={feedbackFilter.type} onChange={(e) => setFeedbackFilter(prev => ({ ...prev, type: e.target.value }))} className="admin-filter-select">
                                    <option value="all">Tất cả thể loại</option><option value="feature">Tính năng</option><option value="ui">Giao diện</option><option value="bug">Lỗi</option>
                                </select>
                            </div>
                        <div className="table-container">
                            <table className="admin-table">
                                <thead><tr><th>Người gửi</th><th>Loại</th><th>Nội dung</th><th>Thời gian</th><th>Hành động</th></tr></thead>
                                <tbody>
                                    {feedbackList
                                        .filter(item => {
                                            const kw = feedbackFilter.search.toLowerCase();
                                            return ((item.username?.toLowerCase().includes(kw)) || (item.email?.toLowerCase().includes(kw))) && (feedbackFilter.type === 'all' || item.type === feedbackFilter.type);
                                        })
                                        .map(item => {
                                            const styleMap = { bug: 'danger', feature: 'info', ui: 'warning', other: 'success' };
                                            return (
                                                <tr key={item.id}>
                                                    <td><b>{item.username || "Ẩn danh"}</b><br/><small className="admin-text-muted">{item.email}</small></td>
                                                    <td><span className={`admin-badge ${styleMap[item.type] || 'success'}`}>{item.type}</span></td>
                                                    <td><div className="admin-text-truncate">{item.content}</div></td>
                                                    <td className="admin-text-muted">{new Date(item.created_at).toLocaleString('vi-VN')}</td>
                                                    <td><button onClick={() => { setFeedbackToDelete(item); setIsDeleteFeedbackModalOpen(true); }} className="btn btn-delete">Xóa</button></td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* NEWSLETTER (GỬI EMAIL) */}
                {activeTab === 'newsletter' && (
                    <div className='fadeIn'>
                        <div className="admin-header-row">
                            <div className="header-mobile-wrapper">
                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    <button className="mobile-menu-toggle" onClick={() => setIsMobileSidebarOpen(true)}>☰</button>
                                    <h1 className='page-title'>Chiến Dịch Email 🚀</h1>
                                </div>
                            </div>
                        </div>
                        <p style={{ color: '#666', marginBottom: '20px' }}>Gửi bản tin ưu đãi, thông báo tính năng mới đến cộng đồng EatDish.</p>
                        
                        <div className="admin-filter-row" style={{ display: 'block', background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                            <label className="feedback-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>Tiêu đề Email:</label>
                            <input 
                                type="text" 
                                placeholder="VD: 🔥 Top 5 Món Ăn Hot Nhất Tuần Qua!" 
                                value={newsletterSubject}
                                onChange={(e) => setNewsletterSubject(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px', fontSize: '15px' }}
                            />

                            <label className="feedback-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>Nội dung (Hỗ trợ thẻ HTML cơ bản: &lt;b&gt;, &lt;br&gt;, &lt;i&gt;):</label>
                            <textarea 
                                placeholder="Nhập nội dung thư vào đây...&#10;Có thể dùng <br> để xuống dòng, <b>chữ đậm</b>..." 
                                style={{ width: '100%', minHeight: '200px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px', resize: 'vertical', fontSize: '15px', fontFamily: 'inherit' }}
                                value={newsletterContent}
                                onChange={(e) => setNewsletterContent(e.target.value)}
                            ></textarea>

                            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', color: '#666', border: '1px dashed #ccc' }}>
                                💡 <b>Mẹo:</b> Hệ thống đã tự động bao bọc bức thư bằng một khung viền đẹp, chèn logo EatDish lên trên cùng và gắn nút "Hủy đăng ký" ở dưới cùng. Bạn chỉ cần nhập đúng phần nội dung cốt lõi của bức thư thôi nhé!
                            </div>

                            <button 
                                onClick={handleSendNewsletter} 
                                disabled={isSendingNewsletter} 
                                style={{ 
                                    background: isSendingNewsletter ? '#ccc' : '#e74c3c', 
                                    color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '8px', 
                                    cursor: isSendingNewsletter ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '15px',
                                    transition: '0.3s'
                                }} 
                            >
                                {isSendingNewsletter ? 'Đang gửi tên lửa đi... 🚀' : 'Phát Sóng Hàng Loạt 📢'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODALS */}
            <AdminPackageModal isOpen={isPackageModalOpen} onClose={() => setIsPackageModalOpen(false)} onSubmit={handleSavePackage} initialData={currentPkg} isEditMode={isEditMode} />
            <AdminCouponModal isOpen={isCouponModalOpen} onClose={() => setIsCouponModalOpen(false)} onSubmit={handleSaveCoupon} initialData={currentCoupon} isEditMode={isCouponEditMode} />
            <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDeleteRecipe} title="Xóa công thức" message={recipeToDelete ? <>Bạn có chắc muốn xóa món <b>{recipeToDelete.title}</b>?</> : ""} />
            <ConfirmModal isOpen={isDeleteUserModalOpen} onClose={() => setIsDeleteUserModalOpen(false)} onConfirm={confirmDeleteUser} title="Xóa người dùng" message={userToDelete ? <>Xóa vĩnh viễn tài khoản <b>@{userToDelete.username}</b>?</> : ""} />
            <ConfirmModal isOpen={isDeleteFeedbackModalOpen} onClose={() => setIsDeleteFeedbackModalOpen(false)} onConfirm={confirmDeleteFeedback} title="Xóa góp ý" message="Bạn muốn xóa phản hồi này?" />
            <ConfirmModal isOpen={isResetPassModalOpen} onClose={() => setIsResetPassModalOpen(false)} onConfirm={confirmResetPass} title="Reset mật khẩu" message="Mật khẩu sẽ về mặc định: 123456" />
            <ConfirmModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} onConfirm={confirmTogglePremium} title={userToToggleVIP?.is_premium === 1 ? "Hủy VIP ❌" : "Cấp VIP 👑"} message={userToToggleVIP ? <>Thay đổi trạng thái Premium cho <b>{userToToggleVIP.fullname}</b>?</> : ""} />
            <ConfirmModal isOpen={isVerifyModalOpen} onClose={() => setIsVerifyModalOpen(false)} onConfirm={confirmToggleVerify} title={userToToggleVerify?.is_verified === 1 ? "Khóa tài khoản" : "Mở khóa tài khoản"} message="Người dùng bị khóa sẽ không thể đăng nhập." />
            <ConfirmModal isOpen={isDeletePostModalOpen} onClose={() => setIsDeletePostModalOpen(false)} onConfirm={confirmDeletePost} title="Xóa bài viết" message="Bạn có chắc chắn muốn xóa bài viết này khỏi cộng đồng?" />
            <ConfirmModal isOpen={isApprovePostModalOpen} onClose={() => setIsApprovePostModalOpen(false)} onConfirm={confirmApprovePost} title="Duyệt bài viết" message="Cho phép bài viết này hiển thị công khai trong cộng đồng?" />
            <ConfirmModal isOpen={isConfirmAddOpen} onClose={() => setIsConfirmAddOpen(false)} onConfirm={confirmAddPackage} title="Thêm gói" message="Tạo gói cước mới này?" />
            <ConfirmModal isOpen={isConfirmDeleteOpen} onClose={() => setIsConfirmDeleteOpen(false)} onConfirm={confirmDeletePackage} title="Xóa gói" message="Xóa gói cước này?" />
            <ConfirmModal isOpen={isDeleteCouponModalOpen} onClose={()=>setIsDeleteCouponModalOpen(false)} onConfirm={handleDeleteCoupon} title="Xóa mã" message="Xóa vĩnh viễn mã giảm giá này?" />
            <ConfirmModal 
                isOpen={isMaintenanceModalOpen} 
                onClose={() => setIsMaintenanceModalOpen(false)} 
                onConfirm={executeToggleMaintenance} 
                title={isMaintenance ? "Tắt Bảo Trì 🟢" : "Bật Bảo Trì 🛠️"} 
                message={isMaintenance ? "Trang web sẽ hoạt động lại bình thường, mở cửa đón khách." : "Bật chế độ tu luyện? Khách hàng sẽ bị chuyển sang trang bảo trì, chỉ Admin mới vào được."} 
            />
            <PackageDetailModal 
                isOpen={isViewPackageModalOpen} 
                onClose={() => setIsViewPackageModalOpen(false)} 
                pkg={pkgToView} 
            />
            
            <RecipeDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} selectedRecipe={selectedRecipeForDetail} />
            <PaymentDetailModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} payment={selectedPayment} />
        </div>
    );
};

const Card = ({ title, value, color, icon }) => (
    <div className="stat-card">
        <div className="stat-icon" style={{ color: color, background: `${color}15` }}>
            {icon}
        </div>
        <div className="stat-card-wrapper">
            <b className="stat-card-val">{value}</b>
            <span className="stat-card-title-text">{title}</span>
        </div>
    </div>
);

export default AdminPage;