import InteractiveLogo from '../components/InteractiveLogo';
import '../index.css';
const Sidebar = ({ activeTab, setActiveTab, onOpenUpload, currentUser }) => {
    const menuItems = [
        { id: 'recipes', icon: '📄', label: 'Công Thức' },
        { id: 'favorites', icon: '❤️', label: 'Yêu Thích' },
        { id: 'community', icon: '👥', label: 'Cộng Đồng' },
        { id: 'premium', icon: '👑', label: 'Nâng Cấp Premium'},
        { id: 'settings', icon: '⚙️', label: 'Cài Đặt' }
    ];

    return (
        <aside className="sidebar-left">
            <div className="sidebar-logo-wrapper">
                <InteractiveLogo />
            </div>

            <nav>
                {menuItems.map(item => (
                    <div 
                        key={item.id}
                        className={`menu-item cursor-pointer ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <span className="menu-icon">{item.icon}</span> 
                        {item.label}
                    </div>
                ))}
            </nav>
            
            <div className="promo-card promo-card-mt">
                <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150" alt="Salad" className="promo-img-round" />
                <h4 className="promo-title-text">Chia sẻ ngay</h4>
                <p className="promo-desc-text">Tải lên công thức của bạn</p>
                <button 
                    className="promo-btn" 
                    onClick={(e) => {
                        e.stopPropagation(); 
                        if (onOpenUpload) onOpenUpload(); 
                    }}
                >
                    Tải Lên
                </button>
            </div>
        </aside>
    );
};
export default Sidebar;