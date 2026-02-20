import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useNavigate, useSearchParams } from 'react-router-dom';
import backgroundImage from '../../logo/background.jpeg';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token'); 
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [msg, setMsg] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        if (password !== confirmPass) return setMsg("Mật khẩu xác nhận không khớp!");
        if (password.length < 6) return setMsg("Mật khẩu phải có ít nhất 6 ký tự");
        
        try {
            await axiosClient.post('/auth/reset-password', { token, newPassword: password });
            setIsSuccess(true);
            setMsg("Đổi mật khẩu thành công!");
            
            setTimeout(() => {
                navigate('/login-register');
            }, 2000);
        } catch (err) {
            setMsg(err.response?.data?.message || "Link đã hết hạn hoặc không hợp lệ");
            setIsSuccess(false);
        }
    };

    if (!token) return (
        <div className="auth-page-wrapper" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <div className="auth-overlay-dark"></div>
            <div className="auth-mini-card">
                <h3>⚠️ Link không hợp lệ hoặc đã hết hạn</h3>
                <button onClick={() => navigate('/login-register')} className="btn-auth-primary">Quay lại trang chủ</button>
            </div>
        </div>
    );

    return (
        <div className="auth-page-wrapper" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <div className="auth-overlay-dark"></div>

            <div className="auth-mini-card">
                <h2 className="auth-card-title">Đặt Lại Mật Khẩu</h2>
                
                {msg && (
                    <div className={isSuccess ? 'auth-msg-success' : 'auth-msg-error'}>
                        {isSuccess ? '✅ ' : '⚠️ '}{msg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="text-left">
                    <div className="auth-input-group mb-15">
                        <label className="auth-label">Mật khẩu mới</label>
                        <input 
                            type="password" 
                            placeholder="********" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="auth-input-field"
                        />
                    </div>
                    
                    <div className="auth-input-group mb-20">
                        <label className="auth-label">Xác nhận mật khẩu</label>
                        <input 
                            type="password" 
                            placeholder="********" 
                            value={confirmPass}
                            onChange={(e) => setConfirmPass(e.target.value)}
                            required
                            className="auth-input-field"
                        />
                    </div>

                    <button type="submit" className="btn-auth-primary">
                        Lưu Mật Khẩu
                    </button>

                    <div className="auth-link-bottom text-center">
                        <span onClick={() => navigate('/login-register')}>
                            ← Quay lại Đăng Nhập
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;