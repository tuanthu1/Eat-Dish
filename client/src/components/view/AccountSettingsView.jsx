import React from 'react';

const AccountSettingsView = ({ 
    setActiveTab, accountSubView, setAccountSubView, 
    passwordData, setPasswordData, handleChangePassword, handleDeleteAccount 
}) => {
    return (
        <div className="fadeIn setting-view-container">
            <div className="setting-header-row">
                <button onClick={() => accountSubView === 'main' ? setActiveTab('settings') : setAccountSubView('main')} className="btn-setting-back">←</button>
                <h2 className="setting-header-title">Tài khoản</h2>
            </div>

            <div className="setting-content-card">
                {accountSubView === 'main' && (
                    <div>
                        <div className="setting-menu-row" onClick={() => setAccountSubView('blocked')}>
                            <span>Danh sách các bếp đã bị chặn</span><span>〉</span>
                        </div>
                        <div className="setting-menu-row" onClick={() => setAccountSubView('password')}>
                            <span>Thay đổi mật khẩu của bạn</span><span>〉</span>
                        </div>
                        <div className="setting-menu-row no-border" onClick={() => setAccountSubView('delete')}>
                            <span>Xóa tài khoản của bạn</span><span>〉</span>
                        </div>
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
                    <div className="setting-blocked-empty">
                        <p>Bạn chưa chặn bất kỳ bếp nào.</p>
                    </div>
                )}

                {accountSubView === 'delete' && (
                    <div className="setting-sub-padding text-center">
                        <p className="setting-delete-warning">Lưu ý: Hành động này không thể hoàn tác.</p>
                        <button onClick={handleDeleteAccount} className="btn-delete-account">Xác nhận xóa tài khoản</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountSettingsView;