import React, { useState, useEffect } from 'react'; 
import ConfirmModal from '../modals/ConfirmModal';
import axiosClient from '../../api/axiosClient';
import '../../index.css';
import { TERMS_OF_SERVICE, PRIVACY_POLICY, COOKIE_POLICY, COMMUNITY_GUIDELINES, FAQ_CONTENT } from '../../data/policyContent';

const SettingView = ({ user }) => {
    const getUserId = () => user?.id || localStorage.getItem('eatdish_user_id');
    const currentUserId = getUserId();
    const [activeTab, setActiveTab] = useState('main'); 
    const [accountSubView, setAccountSubView] = useState('main'); 
    const [blockedList, setBlockedList] = useState([]);
    const [passwordData, setPasswordData] = useState({ old: '', new: '', confirm: '' });
    const [feedbackData, setFeedbackData] = useState({ type: 'Lỗi ứng dụng', content: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const renderPageContent = (title, content, backTo = 'main') => (
        <div className="fadeIn setting-view-container">
            <div className="setting-header-row">
                <button onClick={() => setActiveTab(backTo)} className="btn-setting-back">←</button>
                <h2 className="setting-header-title">{title}</h2>
            </div>
            <div className="setting-document-content">{content}</div>
        </div>
    );

    useEffect(() => { if (accountSubView === 'blocked') fetchBlockedList(); }, [accountSubView]);

    const handleChangePassword = () => {
        if (!passwordData.old || !passwordData.new || !passwordData.confirm) return setError("Vui lòng nhập đầy đủ thông tin!");
        if (passwordData.new !== passwordData.confirm) return setError("Mật khẩu xác nhận không khớp!");
        if (passwordData.new.length < 6) return setError("Mật khẩu mới phải có ít nhất 6 ký tự!");
        setIsConfirmModalOpen(true);
    };

    const submitChangePassword = async () => {
        const currentUser = JSON.parse(localStorage.getItem('user') || localStorage.getItem('eatdish_user'));
        if (!currentUser) return setError("Lỗi user!");
        try {
            await axiosClient.put('/users/change-password', { userId: currentUser.id, oldPassword: passwordData.old, newPassword: passwordData.new });
            setIsConfirmModalOpen(false); setSuccessMsg("Đổi mật khẩu thành công! Vui lòng đăng nhập lại."); setPasswordData({ old: '', new: '', confirm: '' });
            setTimeout(() => { localStorage.clear(); window.location.href = '/login'; }, 2000);
        } catch (err) { setIsConfirmModalOpen(false); setError(err.response?.data?.message || "Đổi mật khẩu thất bại."); }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa tài khoản vĩnh viễn?")) {
            try { await axiosClient.delete(`/users/${user.id}`); localStorage.clear(); window.location.href = '/login'; } catch (err) { setError("Lỗi khi xóa tài khoản."); }
        }
    };

    const handleSubmitFeedback = async () => {
        if (!feedbackData.content.trim()) return setError("Vui lòng nhập nội dung góp ý!");
        if (!currentUserId) return setError("Phiên đăng nhập hết hạn. Hãy đăng nhập lại!");
        setIsSubmitting(true);
        try {
            await axiosClient.post('/feedback', { userId: currentUserId, type: feedbackData.type, content: feedbackData.content });
            setSuccessMsg("Cảm ơn bạn! Góp ý đã được gửi thành công. ❤️"); setFeedbackData({ type: 'Lỗi ứng dụng', content: '' }); setActiveTab('main');
        } catch (err) { setError("Lỗi Server. Vui lòng thử lại sau."); } finally { setIsSubmitting(false); }
    };

    const fetchBlockedList = async () => {
        try { setBlockedList((await axiosClient.get(`/users/blocked?userId=${currentUserId}`)).data); } catch (e) { console.error(e); }
    };

    const handleUnblock = async (blockedId) => {
        if(!window.confirm("Bạn muốn bỏ chặn người này?")) return;
        try { await axiosClient.post('/users/unblock', { blockerId: currentUserId, blockedId }); fetchBlockedList(); } catch (e) { setError("Lỗi khi bỏ chặn"); }
    };

    useEffect(() => {
        if (error || successMsg) { const timer = setTimeout(() => { setError(''); setSuccessMsg(''); }, 3000); return () => clearTimeout(timer); }
    }, [error, successMsg]);

    return (
        <div id="view-settings" className="fadeIn">
            {(error || successMsg) && (
                <div className={`setting-toast-alert ${error ? 'error' : 'success'}`}>
                    <span>{error ? '⚠️' : '✅'}</span> <span>{error || successMsg}</span>
                </div>
            )}
            
            {activeTab === 'main' && (
                <>
                    <div className="setting-banner">
                        <div className="banner-text"><h1>Cài đặt</h1><p>Quản lý bếp và trải nghiệm cá nhân.</p></div>
                    </div>
                    <div className="setting-content-card">
                        <div className="setting-menu-row" onClick={() => setActiveTab('account_settings')}><span>🛡️ Tài khoản & Bảo mật</span><span>〉</span></div>
                        <div className="setting-menu-row" onClick={() => setActiveTab('notifications_settings')}><span>🔔 Cài đặt thông báo</span><span>〉</span></div>
                        <div className="setting-menu-row" onClick={() => setActiveTab('faq')}><span>❓ Câu hỏi thường gặp (FAQ)</span><span>〉</span></div>
                        <div className="setting-menu-row" onClick={() => setActiveTab('feedback')}><span>💌 Góp ý & Phản hồi</span><span>〉</span></div>
                        <div className="setting-menu-row no-border" onClick={() => setActiveTab('policies_menu')}><span>⚖️ Pháp lý & Chính sách</span><span>〉</span></div>
                    </div>
                </>
            )}

            {activeTab === 'account_settings' && (
                <div className="fadeIn setting-view-container">
                    <div className="setting-header-row">
                        <button onClick={() => accountSubView === 'main' ? setActiveTab('main') : setAccountSubView('main')} className="btn-setting-back">←</button>
                        <h2 className="setting-header-title">Tài khoản</h2>
                    </div>
                    <div className="setting-content-card">
                        {accountSubView === 'main' && (
                            <div>
                                <div className="setting-menu-row" onClick={() => setAccountSubView('blocked')}><span>Danh sách chặn</span><span>〉</span></div>
                                <div className="setting-menu-row" onClick={() => setAccountSubView('password')}><span>Đổi mật khẩu</span><span>〉</span></div>
                                <div className="setting-menu-row no-border" onClick={() => setAccountSubView('delete')}><span style={{ color: '#e74c3c' }}>Xóa tài khoản</span><span>〉</span></div>
                            </div>
                        )}
                        {accountSubView === 'password' && (
                            <div className="setting-sub-padding">
                                <h3 className="mb-20">Đổi mật khẩu</h3>
                                <input type="password" placeholder="Mật khẩu cũ" className="account-input" value={passwordData.old} onChange={(e) => setPasswordData({...passwordData, old: e.target.value})} />
                                <input type="password" placeholder="Mật khẩu mới" className="account-input" value={passwordData.new} onChange={(e) => setPasswordData({...passwordData, new: e.target.value})} />
                                <input type="password" placeholder="Xác nhận mật khẩu mới" className="account-input" value={passwordData.confirm} onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})} />
                                <button onClick={handleChangePassword} className="btn-account-save">Lưu mật khẩu mới</button>
                            </div>
                        )}
                        {accountSubView === 'blocked' && (
                            <div className="setting-sub-padding">
                                <h3 className="mb-20">Danh sách chặn ({blockedList.length})</h3>
                                {blockedList.length === 0 ? (
                                    <div className="setting-blocked-empty">Bạn chưa chặn ai.</div>
                                ) : (
                                    <div className="blocked-list-wrapper">
                                        {blockedList.map(u => (
                                            <div key={u.id} className="setting-blocked-item">
                                                <div className="flex-align-center gap-10">
                                                    <img src={u.avatar || "https://via.placeholder.com/40"} alt="avt" className="blocked-avt" />
                                                    <div><div className="bold-name">{u.fullname}</div><div className="blocked-username">@{u.username}</div></div>
                                                </div>
                                                <button onClick={() => handleUnblock(u.id)} className="btn-unblock">🔓 Bỏ chặn</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {accountSubView === 'delete' && (
                            <div className="setting-sub-padding text-center">
                                <p className="setting-delete-warning">⚠️ Hành động này không thể hoàn tác.</p>
                                <button onClick={handleDeleteAccount} className="btn-delete-account">Xác nhận xóa</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'notifications_settings' && (
                <div className="fadeIn setting-view-container">
                    <div className="setting-header-row">
                        <button onClick={() => setActiveTab('main')} className="btn-setting-back">←</button>
                        <h2 className="setting-header-title">Thông báo</h2>
                    </div>
                    <div className="setting-content-card">
                        <h3 className="mb-20">Email</h3>
                        {[
                            { id: 'tutorial', label: 'Hướng dẫn sử dụng', desc: 'Email hướng dẫn tính năng mới.' },
                            { id: 'newsletter', label: 'Bản tin EatDish', desc: 'Gợi ý món ngon và sự kiện cộng đồng.' }
                        ].map(item => (
                            <div key={item.id} className="notif-item-row">
                                <input type="checkbox" defaultChecked className="notif-checkbox" />
                                <div><div className="notif-item-label">{item.label}</div><div className="notif-item-desc">{item.desc}</div></div>
                            </div>
                        ))}
                        <button onClick={() => { alert('Đã lưu!'); setActiveTab('main'); }} className="btn-account-save mt-10">Lưu cài đặt</button>
                    </div>
                </div>
            )}

            {activeTab === 'feedback' && (
                <div className="fadeIn setting-view-container">
                    <div className="setting-header-row">
                        <button onClick={() => setActiveTab('main')} className="btn-setting-back">←</button>
                        <h2 className="setting-header-title">Góp ý & Phản hồi</h2>
                    </div>
                    <div className="setting-content-card">
                        <label className="feedback-label">Vấn đề của bạn:</label>
                        <select value={feedbackData.type} onChange={(e) => setFeedbackData({...feedbackData, type: e.target.value})} className="feedback-select">
                            <option value="bug">Lỗi ứng dụng</option>
                            <option value="feature">Đóng góp tính năng</option>
                            <option value="ui">Giao diện</option>
                            <option value="other">Khác</option>
                        </select>
                        <label className="feedback-label">Nội dung chi tiết:</label>
                        <textarea placeholder="Nhập ý kiến đóng góp của bạn..." value={feedbackData.content} onChange={(e) => setFeedbackData({...feedbackData, content: e.target.value})} className="feedback-textarea"></textarea>
                        <button onClick={handleSubmitFeedback} disabled={isSubmitting} className={`btn-account-save ${isSubmitting ? 'opacity-70' : ''}`}>
                            {isSubmitting ? 'Đang gửi... ⏳' : 'Gửi góp ý 🚀'}
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'policies_menu' && (
                <div className="fadeIn setting-view-container">
                    <div className="setting-header-row">
                        <button onClick={() => setActiveTab('main')} className="btn-setting-back">←</button>
                        <h2 className="setting-header-title">Pháp lý & Chính sách</h2>
                    </div>
                    <div className="setting-content-card">
                        <div className="setting-menu-row" onClick={() => setActiveTab('policy_terms')}><span>📄 Điều khoản dịch vụ</span><span>〉</span></div>
                        <div className="setting-menu-row" onClick={() => setActiveTab('policy_privacy')}><span>🔒 Chính sách bảo mật</span><span>〉</span></div>
                        <div className="setting-menu-row" onClick={() => setActiveTab('policy_cookie')}><span>🍪 Chính sách Cookie</span><span>〉</span></div>
                        <div className="setting-menu-row no-border" onClick={() => setActiveTab('policy_community')}><span>🤝 Nguyên tắc cộng đồng</span><span>〉</span></div>
                    </div>
                </div>
            )}

            {activeTab === 'faq' && renderPageContent("Câu hỏi thường gặp", FAQ_CONTENT)}
            {activeTab === 'policy_terms' && renderPageContent("Điều khoản dịch vụ", TERMS_OF_SERVICE, 'policies_menu')}
            {activeTab === 'policy_privacy' && renderPageContent("Chính sách bảo mật", PRIVACY_POLICY, 'policies_menu')}
            {activeTab === 'policy_cookie' && renderPageContent("Chính sách Cookie", COOKIE_POLICY, 'policies_menu')}
            {activeTab === 'policy_community' && renderPageContent("Nguyên tắc cộng đồng", COMMUNITY_GUIDELINES, 'policies_menu')}
            <ConfirmModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={submitChangePassword} title="Xác nhận đổi mật khẩu" message="Bạn có chắc chắn muốn thay đổi mật khẩu không? Bạn sẽ cần đăng nhập lại sau khi đổi." />
        </div>
    );
};

export default SettingView;