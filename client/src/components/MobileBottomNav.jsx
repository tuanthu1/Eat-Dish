import { CookingPot, Heart, PlusCircle, Users, Settings } from 'lucide-react';

const MobileBottomNav = ({ activeTab, setActiveTab, onOpenUpload }) => {
    const navItems = [
        { id: 'recipes', label: 'Công thức', icon: CookingPot },
        { id: 'favorites', label: 'Yêu thích', icon: Heart },
        { id: 'community', label: 'Cộng đồng', icon: Users },
        { id: 'settings', label: 'Cài đặt', icon: Settings }
    ];

    const handleTabClick = (tabId) => {
        if (typeof setActiveTab === 'function') {
            setActiveTab(tabId);
            localStorage.setItem('eatdish_active_tab', tabId);
            window.scrollTo(0, 0);
        }
    };

    return (
        <nav aria-label="Mobile navigation" className="mobile-bottom-nav">
            {navItems.slice(0, 2).map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                    <button
                        key={item.id}
                        type="button"
                        className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => handleTabClick(item.id)}
                    >
                        <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
                        <span>{item.label}</span>
                    </button>
                );
            })}

            <button
                type="button"
                className="mobile-bottom-nav-upload"
                onClick={onOpenUpload}
                aria-label="Tải công thức lên"
            >
                <span className="mobile-bottom-nav-upload-bubble">
                    <PlusCircle size={26} strokeWidth={2.4} />
                </span>
            </button>

            {navItems.slice(2).map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                    <button
                        key={item.id}
                        type="button"
                        className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => handleTabClick(item.id)}
                    >
                        <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
};

export default MobileBottomNav;
