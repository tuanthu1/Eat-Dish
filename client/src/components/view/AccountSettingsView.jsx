import React, { useMemo } from 'react';
import { ChevronLeft, KeyRound, LockKeyhole, Trash2, ShieldAlert, Save, UserCog, TriangleAlert, Sparkles, CircleUserRound } from 'lucide-react';

const AccountSettingsView = ({
    setActiveTab,
    accountSubView,
    setAccountSubView,
    passwordData,
    setPasswordData,
    handleChangePassword,
    handleDeleteAccount
}) => {
    const currentUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch {
            return {};
        }
    }, []);

    const userName = currentUser?.fullname || currentUser?.username || 'Tài khoản của bạn';
    const userEmail = currentUser?.email || 'Chưa có email hiển thị';

    const cardStyle = {
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)',
        border: '1px solid #f1f5f9',
        overflow: 'hidden'
    };

    const sectionTitleStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 22,
        fontWeight: 800,
        color: '#111827'
    };

    const rowStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '16px 18px',
        borderBottom: '1px solid #f3f4f6',
        cursor: 'pointer'
    };

    const inputStyle = {
        width: '100%',
        padding: '14px 16px',
        borderRadius: 14,
        border: '1px solid #e5e7eb',
        background: '#f8fafc',
        outline: 'none',
        fontSize: 15,
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
    };

    const actionButtonStyle = {
        width: '100%',
        border: 'none',
        borderRadius: 14,
        padding: '14px 18px',
        fontSize: 15,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10
    };

    const renderHeader = (title, subtitle) => (
        <div style={{ padding: 20, borderBottom: '1px solid #eef2f7' }}>
            <div style={sectionTitleStyle}>
                <UserCog size={24} color="#ff9f1c" />
                {title}
            </div>
            <p style={{ margin: '10px 0 0', color: '#6b7280', lineHeight: 1.6 }}>{subtitle}</p>
        </div>
    );

    const renderMain = () => (
        <>
            {renderHeader(
                'Tài khoản & bảo mật',
                'Quản lý mật khẩu, thao tác bảo mật và các hành động quan trọng của tài khoản.'
            )}

            <div style={{ padding: 18, display: 'grid', gap: 14 }}>
                <div style={{ ...cardStyle, boxShadow: 'none' }}>
                    <div style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #ff9f1c, #ff6a00)', display: 'grid', placeItems: 'center', color: '#fff' }}>
                            <CircleUserRound size={28} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 17, fontWeight: 800, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
                            <div style={{ fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail}</div>
                        </div>
                    </div>
                </div>

                <div style={cardStyle}>
                    <div style={rowStyle} onClick={() => setAccountSubView('password')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#fff7ed', display: 'grid', placeItems: 'center', color: '#ff9f1c' }}>
                                <KeyRound size={20} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, color: '#111827' }}>Đổi mật khẩu</div>
                                <div style={{ fontSize: 13, color: '#6b7280' }}>Cập nhật mật khẩu để tăng bảo mật</div>
                            </div>
                        </div>
                        <span style={{ color: '#9ca3af' }}>〉</span>
                    </div>

                    <div style={rowStyle} onClick={() => setAccountSubView('delete')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#fef2f2', display: 'grid', placeItems: 'center', color: '#ef4444' }}>
                                <Trash2 size={20} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, color: '#111827' }}>Xóa tài khoản</div>
                                <div style={{ fontSize: 13, color: '#6b7280' }}>Hành động vĩnh viễn, không thể hoàn tác</div>
                            </div>
                        </div>
                        <span style={{ color: '#9ca3af' }}>〉</span>
                    </div>
                </div>

                <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #fffaf2, #fff)', padding: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#9a3412', fontWeight: 700, marginBottom: 8 }}>
                        <Sparkles size={18} /> Mẹo bảo mật
                    </div>
                    <p style={{ margin: 0, color: '#7c2d12', lineHeight: 1.7, fontSize: 14 }}>
                        Hãy chọn mật khẩu mạnh, không dùng lại mật khẩu cũ và tránh chia sẻ tài khoản trên thiết bị công cộng.
                    </p>
                </div>
            </div>
        </>
    );

    const renderPassword = () => (
        <>
            <div style={{ padding: 20, borderBottom: '1px solid #eef2f7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={sectionTitleStyle}>
                    <KeyRound size={24} color="#ff9f1c" />
                    Đổi mật khẩu
                </div>
                <button
                    type="button"
                    onClick={() => setAccountSubView('main')}
                    style={{ border: 'none', background: '#f8fafc', borderRadius: 12, padding: '10px 12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, color: '#111827', fontWeight: 600 }}
                >
                    <ChevronLeft size={18} /> Quay lại
                </button>
            </div>

            <form onSubmit={handleChangePassword} style={{ padding: 18 }}>
                <div style={cardStyle}>
                    <div style={{ padding: 18, display: 'grid', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, color: '#374151' }}>Mật khẩu hiện tại</label>
                            <input
                                type="password"
                                className="account-input"
                                style={inputStyle}
                                placeholder="Nhập mật khẩu cũ"
                                autoComplete="current-password"
                                value={passwordData.old}
                                onChange={(e) => setPasswordData({ ...passwordData, old: e.target.value })}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, color: '#374151' }}>Mật khẩu mới</label>
                            <input
                                type="password"
                                className="account-input"
                                style={inputStyle}
                                placeholder="Nhập mật khẩu mới"
                                autoComplete="new-password"
                                value={passwordData.new}
                                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, color: '#374151' }}>Xác nhận mật khẩu mới</label>
                            <input
                                type="password"
                                className="account-input"
                                style={inputStyle}
                                placeholder="Nhập lại mật khẩu mới"
                                autoComplete="new-password"
                                value={passwordData.confirm}
                                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                            />
                        </div>

                        <div style={{ background: '#f8fafc', borderRadius: 14, padding: 14, color: '#6b7280', fontSize: 14, lineHeight: 1.7 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0f766e', fontWeight: 700, marginBottom: 6 }}>
                                <ShieldAlert size={18} /> Lưu ý
                            </div>
                            Mật khẩu mới nên có ít nhất 6 ký tự và không trùng với mật khẩu hiện tại.
                        </div>

                        <button type="submit" style={{ ...actionButtonStyle, background: 'linear-gradient(135deg, #ff9f1c, #ff7f11)', color: '#fff', boxShadow: '0 10px 20px rgba(255, 159, 28, 0.25)' }}>
                            <Save size={18} /> Lưu mật khẩu mới
                        </button>
                    </div>
                </div>
            </form>
        </>
    );

    const renderDelete = () => (
        <>
            <div style={{ padding: 20, borderBottom: '1px solid #eef2f7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={sectionTitleStyle}>
                    <Trash2 size={24} color="#ef4444" />
                    Xóa tài khoản
                </div>
                <button
                    type="button"
                    onClick={() => setAccountSubView('main')}
                    style={{ border: 'none', background: '#f8fafc', borderRadius: 12, padding: '10px 12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, color: '#111827', fontWeight: 600 }}
                >
                    <ChevronLeft size={18} /> Quay lại
                </button>
            </div>

            <div style={{ padding: 18 }}>
                <div style={{ ...cardStyle, background: '#fff7f7', borderColor: '#fee2e2' }}>
                    <div style={{ padding: 18 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#dc2626', fontWeight: 800, marginBottom: 10 }}>
                            <TriangleAlert size={20} /> Cảnh báo
                        </div>
                        <p style={{ margin: 0, color: '#7f1d1d', lineHeight: 1.7, fontSize: 14 }}>
                            Khi xóa tài khoản, toàn bộ dữ liệu liên quan sẽ bị xóa vĩnh viễn và không thể khôi phục.
                        </p>

                        <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
                            <div style={{ background: '#fff', borderRadius: 14, padding: 14, border: '1px solid #fee2e2', color: '#7f1d1d' }}>
                                <div style={{ fontWeight: 700, marginBottom: 6 }}>Điều gì sẽ xảy ra?</div>
                                <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                                    <li>Bài viết, công thức và tương tác liên quan</li>
                                    <li>Thông tin đăng nhập và hồ sơ cá nhân</li>
                                    <li>Lịch sử hoạt động gắn với tài khoản</li>
                                </ul>
                            </div>

                            <button type="button" onClick={handleDeleteAccount} style={{ ...actionButtonStyle, background: '#ef4444', color: '#fff', boxShadow: '0 10px 20px rgba(239, 68, 68, 0.22)' }}>
                                <Trash2 size={18} /> Xác nhận xóa tài khoản
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div className="account-settings-container fadeIn" style={{ maxWidth: 980, margin: '0 auto', paddingBottom: 24 }}>
            <div style={{ marginBottom: 16, color: '#6b7280', fontSize: 14 }}>
                Quản lý tài khoản EatDish của bạn một cách nhanh chóng và an toàn.
            </div>

            <div style={cardStyle}>
                {accountSubView === 'main' && renderMain()}
                {accountSubView === 'password' && renderPassword()}
                {accountSubView === 'delete' && renderDelete()}
            </div>

            {accountSubView !== 'main' && (
                <div style={{ marginTop: 14, textAlign: 'center' }}>
                    <button
                        type="button"
                        onClick={() => setActiveTab('main')}
                        style={{ border: 'none', background: 'transparent', color: '#ff9f1c', fontWeight: 700, cursor: 'pointer' }}
                    >
                        Về trang cài đặt chính
                    </button>
                </div>
            )}
        </div>
    );
};

export default AccountSettingsView;