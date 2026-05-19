import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Frown } from 'lucide-react'; // Lấy icon từ Lucide

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#fff',
            color: '#333',
            textAlign: 'center',
            padding: '20px'
        }}>
            {/* Icon vui nhộn */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
                <ChefHat size={120} color="#e0e0e0" strokeWidth={1.5} />
                <Frown size={40} color="#ff9f1c" style={{ position: 'absolute', bottom: '20px', left: '40px' }} />
            </div>

            {/* Chữ 404 to đùng */}
            <h1 style={{ 
                fontSize: '100px', 
                margin: '0', 
                color: '#ff9f1c', 
                lineHeight: '1',
                fontFamily: "'Nunito', sans-serif",
                fontWeight: '900'
            }}>
                404
            </h1>

            {/* Câu thông báo */}
            <h2 style={{ fontSize: '28px', margin: '15px 0', color: '#444' }}>
                Ôi không! Trang này không tồn tại
            </h2>
            
            <p style={{ fontSize: '16px', color: '#777', maxWidth: '450px', marginBottom: '40px', lineHeight: '1.6' }}>
                Có vẻ như trang bạn đang tìm kiếm đã bị gỡ bỏ, đổi tên hoặc chưa từng xuất hiện trên thực đơn của hệ thống EatDish.
            </p>

            {/* Nút quay về */}
            <button
                onClick={() => navigate('/')}
                style={{
                    padding: '14px 35px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor: '#ff9f1c',
                    border: 'none',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 15px rgba(255, 159, 28, 0.3)',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 159, 28, 0.4)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 159, 28, 0.3)';
                }}
            >
                Quay về Trang chủ
            </button>
        </div>
    );
};

export default NotFound;