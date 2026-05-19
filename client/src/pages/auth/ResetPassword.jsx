import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Home, LoaderCircle, Lock, RefreshCcw, ShieldAlert } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import '../../index.css';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [status, setStatus] = useState('ready');
    const [message, setMessage] = useState('Nhập mật khẩu mới để hoàn tất quá trình đặt lại.');
    const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Thiếu token đặt lại mật khẩu trong đường dẫn.');
        }
    }, [token]);

    const ui = useMemo(() => {
        if (status === 'success') {
            return {
                icon: <CheckCircle2 size={56} color="#16a34a" />,
                title: 'Đặt lại mật khẩu thành công',
                subtitle: message || 'Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập ngay.'
            };
        }

        if (status === 'error') {
            return {
                icon: <ShieldAlert size={56} color="#dc2626" />,
                title: 'Không thể đặt lại mật khẩu',
                subtitle: message || 'Link đặt lại không hợp lệ hoặc đã hết hạn.'
            };
        }

        if (status === 'loading') {
            return {
                icon: <LoaderCircle size={56} color="#ff7f11" className="spin" />,
                title: 'Đang xử lý...',
                subtitle: message
            };
        }

        return {
            icon: <Lock size={56} color="#ff7f11" />,
            title: 'Đặt lại mật khẩu',
            subtitle: message
        };
    }, [message, status]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            setStatus('error');
            setMessage('Thiếu token đặt lại mật khẩu trong đường dẫn.');
            return;
        }

        if (!formData.newPassword || !formData.confirmPassword) {
            setStatus('error');
            setMessage('Vui lòng nhập đầy đủ mật khẩu mới và xác nhận.');
            return;
        }

        if (formData.newPassword.length < 6) {
            setStatus('error');
            setMessage('Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setStatus('error');
            setMessage('Mật khẩu xác nhận không khớp.');
            return;
        }

        setIsSubmitting(true);
        setStatus('loading');
        setMessage('Đang cập nhật mật khẩu mới...');

        try {
            const res = await axiosClient.post('/auth/reset-password', {
                token,
                newPassword: formData.newPassword
            });

            setStatus('success');
            setMessage(res.data?.message || 'Đặt lại mật khẩu thành công.');
            setTimeout(() => {
                navigate('/login-register');
            }, 1800);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Không thể đặt lại mật khẩu lúc này.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page-wrapper" style={{ background: 'linear-gradient(120deg, #fff7ed 0%, #ffedd5 100%)' }}>
            <div className="auth-overlay-dark" style={{ background: 'rgba(255, 255, 255, 0.55)' }}></div>
            <div
                style={{
                    position: 'relative',
                    zIndex: 2,
                    width: 'min(560px, 92vw)',
                    background: '#fff',
                    borderRadius: 20,
                    padding: '28px 24px',
                    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.15)',
                    textAlign: 'center'
                }}
            >
                <div style={{ marginBottom: 14 }}>{ui.icon}</div>
                <h1 style={{ margin: 0, color: '#111827', fontSize: 28, fontWeight: 800 }}>{ui.title}</h1>
                <p style={{ margin: '12px 0 24px', color: '#4b5563', lineHeight: 1.55 }}>{ui.subtitle}</p>

                {status === 'ready' && token && (
                    <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                        <div className="auth-input-group" style={{ marginBottom: 14 }}>
                            <label className="auth-label">Mật khẩu mới</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Nhập mật khẩu mới..."
                                className="auth-input-field"
                                autoComplete="new-password"
                            />
                        </div>

                        <div className="auth-input-group" style={{ marginBottom: 18 }}>
                            <label className="auth-label">Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Nhập lại mật khẩu mới..."
                                className="auth-input-field"
                                autoComplete="new-password"
                            />
                        </div>

                        <button type="submit" disabled={isSubmitting} className="btn-auth-primary" style={{ width: '100%' }}>
                            {isSubmitting ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                        </button>
                    </form>
                )}

                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 18 }}>
                    {status === 'error' && (
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="btn-auth-primary"
                            style={{ minWidth: 180 }}
                        >
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                <RefreshCcw size={18} /> Thử lại
                            </span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => navigate('/login-register')}
                        className="btn-auth-primary"
                        style={{ minWidth: 180 }}
                    >
                        Đến trang đăng nhập
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="ghost"
                        style={{ minWidth: 160, color: '#ff7f11', borderColor: '#ff7f11' }}
                    >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <Home size={18} /> Về trang chủ
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
