import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Home, LoaderCircle, MailWarning, RefreshCcw } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import '../../index.css';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('Đang xác minh email của bạn...');
    const [isRetrying, setIsRetrying] = useState(false);

    const ui = useMemo(() => {
        if (status === 'success') {
            return {
                icon: <CheckCircle2 size={56} color="#16a34a" />,
                title: 'Xác minh thành công',
                subtitle: message || 'Email của bạn đã được xác minh. Bạn có thể đăng nhập ngay.'
            };
        }

        if (status === 'error') {
            return {
                icon: <MailWarning size={56} color="#dc2626" />,
                title: 'Xác minh thất bại',
                subtitle: message || 'Token không hợp lệ hoặc đã hết hạn.'
            };
        }

        return {
            icon: <LoaderCircle size={56} color="#ff7f11" className="spin" />,
            title: 'Đang xác minh email',
            subtitle: message
        };
    }, [message, status]);

    const verifyEmail = async () => {
        if (!token) {
            setStatus('error');
            setMessage('Thiếu token xác minh trong đường dẫn.');
            return;
        }

        try {
            if (isRetrying) {
                setStatus('loading');
                setMessage('Đang thử xác minh lại...');
            }
            const res = await axiosClient.get('/auth/verify-email', {
                params: { token }
            });
            setStatus('success');
            setMessage(res.data?.message || 'Xác minh email thành công.');
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Không thể xác minh email lúc này.');
        } finally {
            setIsRetrying(false);
        }
    };

    useEffect(() => {
        verifyEmail();
    }, []);

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

                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {status === 'error' && (
                        <button
                            type="button"
                            onClick={() => {
                                setIsRetrying(true);
                                verifyEmail();
                            }}
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

export default VerifyEmail;
