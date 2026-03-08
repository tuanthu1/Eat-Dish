import React from 'react';

const NotificationSettingsView = ({ setActiveTab }) => {
    const notificationItems = [
        { id: 'tutorial', label: 'Hướng dẫn', desc: 'Chúng tôi sẽ email cho bạn để hướng dẫn cách tận dụng tốt nhất các tính năng của Eatdish.' },
        { id: 'from_eatdish', label: 'Từ Eatdish', desc: 'Chúng tôi sẽ email cho bạn về những sự kiện theo mùa, khảo sát và bí quyết hay từ đội ngũ Admin.' },
        { id: 'newsletter', label: 'Bản tin', desc: 'Chúng tôi sẽ email cho bạn về những bản tin, gợi ý món ngon và sự kiện nổi bật về cộng đồng Eatdish.' }
    ];

    return (
        <div className="fadeIn notif-settings-container">
            <h1 className="notif-settings-title">Điều chỉnh chức năng thông báo</h1>
            
            <div className="text-left mb-40">
                <h3 className="notif-group-title">Email</h3>
                {notificationItems.map((item) => (
                    <div key={item.id} className="notif-item-row">
                        <input type="checkbox" defaultChecked id={item.id} className="notif-checkbox" />
                        <label htmlFor={item.id} className="cursor-pointer">
                            <div className="notif-item-label">{item.label}</div>
                            <div className="notif-item-desc">{item.desc}</div>
                        </label>
                    </div>
                ))}
            </div>

            <div className="text-center">
                <button onClick={() => { alert('Đã cập nhật!'); setActiveTab('settings'); }} className="btn-update-notif">
                    Cập nhật
                </button>
            </div>
        </div>
    );
};

export default NotificationSettingsView;