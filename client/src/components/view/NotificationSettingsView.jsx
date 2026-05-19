import React, { useState } from 'react';
import { Bell, Mail, Smartphone, Heart, MessageSquare, UserPlus, Save } from 'lucide-react';
import { toast } from 'react-toastify';

const NotificationSettingsView = ({ initialSettings, onSaveSettings }) => {
    // Khởi tạo state cho các cài đặt thông báo (Mặc định bật hết cho xôm)
    const [settings, setSettings] = useState(initialSettings || {
        push_likes: true,
        push_comments: true,
        push_followers: true,
        email_promotions: false,
        email_updates: true
    });

    // Hàm xử lý khi gạt công tắc
    const handleToggle = (key) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Hàm lưu cài đặt
    const handleSubmit = async () => {
        try {
            if (onSaveSettings) {
                await onSaveSettings(settings); // Bắn API cập nhật lên server
            }
            toast.success('Đã lưu cài đặt thông báo!');
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi lưu cài đặt!');
        }
    };

    // --- COMPONENT CON: TẠO CÁI CÔNG TẮC (TOGGLE SWITCH) CỰC XỊN ---
    const ToggleRow = ({ icon: Icon, title, description, stateKey }) => {
        const isChecked = settings[stateKey];
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                    <div style={{ padding: '10px', backgroundColor: '#fff3e0', borderRadius: '50%', color: '#ff9f1c', display: 'flex' }}>
                        <Icon size={20} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', color: '#333', fontSize: '15px' }}>{title}</div>
                        <div style={{ fontSize: '13px', color: '#777', marginTop: '4px' }}>{description}</div>
                    </div>
                </div>
                
                {/* CSS Inline cho cái công tắc gạt gạt */}
                <div 
                    onClick={() => handleToggle(stateKey)}
                    style={{
                        width: '46px',
                        height: '24px',
                        backgroundColor: isChecked ? '#ff9f1c' : '#ccc',
                        borderRadius: '24px',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s'
                    }}
                >
                    <div style={{
                        width: '18px',
                        height: '18px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '3px',
                        left: isChecked ? '25px' : '3px',
                        transition: 'left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                </div>
            </div>
        );
    };

    return (
        <div className="notification-settings-container" style={{ padding: '20px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            
            {/* Header */}
            <div style={{ marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <h2 style={{ margin: '0', color: '#ff9f1c', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Bell size={24} /> Quản lý thông báo
                </h2>
                <p style={{ margin: '5px 0 0 0', color: '#777', fontSize: '14px' }}>
                    Chọn những thông báo bạn muốn nhận để không bỏ lỡ tương tác từ cộng đồng.
                </p>
            </div>

            {/* Khối 1: Thông báo đẩy (In-app / Push Notifications) */}
            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '16px', color: '#444', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Smartphone size={18} /> Thông báo trên Ứng dụng
                </h3>
                <div style={{ backgroundColor: '#fafafa', padding: '0 20px', borderRadius: '8px', border: '1px solid #eee' }}>
                    <ToggleRow 
                        icon={Heart} 
                        title="Lượt yêu thích" 
                        description="Thông báo khi ai đó thả tim công thức của bạn." 
                        stateKey="push_likes" 
                    />
                    <ToggleRow 
                        icon={MessageSquare} 
                        title="Bình luận mới" 
                        description="Thông báo khi có người bình luận vào bài viết của bạn." 
                        stateKey="push_comments" 
                    />
                    <ToggleRow 
                        icon={UserPlus} 
                        title="Người theo dõi mới" 
                        description="Thông báo khi ai đó bấm Theo dõi (Follow) bạn." 
                        stateKey="push_followers" 
                    />
                </div>
            </div>

            {/* Khối 2: Thông báo qua Email */}
            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '16px', color: '#444', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={18} /> Thông báo qua Email
                </h3>
                <div style={{ backgroundColor: '#fafafa', padding: '0 20px', borderRadius: '8px', border: '1px solid #eee' }}>
                    <ToggleRow 
                        icon={Bell} 
                        title="Cập nhật từ EatDish" 
                        description="Nhận email về các tính năng mới hoặc thay đổi hệ thống." 
                        stateKey="email_updates" 
                    />
                    <ToggleRow 
                        icon={Mail} 
                        title="Khuyến mãi & Gợi ý" 
                        description="Nhận mã giảm giá gói Premium và gợi ý món ăn tuần." 
                        stateKey="email_promotions" 
                    />
                </div>
            </div>

            {/* Nút Submit */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <button 
                    onClick={handleSubmit}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 30px',
                        backgroundColor: '#ff9f1c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(255, 159, 28, 0.3)',
                        transition: 'background 0.2s'
                    }}
                >
                    <Save size={20} /> Lưu thay đổi
                </button>
            </div>

        </div>
    );
};

export default NotificationSettingsView;