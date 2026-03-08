import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient"; 
import '../../index.css'; 

export default function VerifyEmail() {
    const [params] = useSearchParams();
    const token = params.get("token");
    const navigate = useNavigate();
    const calledRef = useRef(false);
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('Đang xác minh email của bạn...');

    useEffect(() => {
        if (!token || calledRef.current) return;

        calledRef.current = true;

        axiosClient.get(`/auth/verify-email?token=${token}`)
            .then(() => {
                setStatus('success');
                setMessage("Xác minh email thành công! Đang chuyển hướng về trang đăng nhập...");
                setTimeout(() => navigate('/login-register'), 3000);
            })
            .catch((err) => {
                setStatus('error');
                setMessage(
                    err.response?.data?.message || "Token không hợp lệ hoặc đã hết hạn."
                );
            });
    }, [token, navigate]);

    return (
        <div className="auth-page-wrapper">
            <div className="auth-overlay-dark"></div>

            <div className="verify-email-card">
                <div className="verify-icon">
                    {status === 'loading' && <div className="spinner">⏳</div>}
                    {status === 'success' && "✅"}
                    {status === 'error' && "❌"}
                </div>

                <h2 className="verify-title">
                    {status === 'loading' ? "Vui lòng chờ" : status === 'success' ? "Thành Công!" : "Rất tiếc"}
                </h2>
                
                <p className="verify-desc">
                    {message}
                </p>

                {status === 'error' && (
                    <button 
                        onClick={() => navigate('/login-register')}
                        className="btn-auth-primary mt-25"
                    >
                        Quay lại Đăng nhập
                    </button>
                )}
            </div>
        </div>
    );
}