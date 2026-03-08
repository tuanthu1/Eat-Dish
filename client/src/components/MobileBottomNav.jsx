import React, { useRef, useEffect, useState } from 'react';

// 1. ĐƯA MẢNG TABS RA NGOÀI COMPONENT (Để React không tạo lại mỗi lần render)
const tabs = [
    { id: 'recipes', icon: 'home', label: 'Trang chủ' },
    { id: 'community', icon: 'forum', label: 'Cộng đồng' },
    { id: 'action', isAction: true },
    { id: 'favorites', icon: 'bookmark', label: 'Đã lưu' },
    { id: 'settings', icon: 'settings', label: 'Cài đặt' },
];

const MobileBottomNav = ({ activeTab, setActiveTab, onOpenUpload }) => {
    const navRef = useRef(null);
    const tabsRef = useRef([]);
    const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0, opacity: 0 });

    useEffect(() => {
        const activeTabIndex = tabs.findIndex(tab => tab.id === activeTab);
        
        // Nếu là nút action ở giữa hoặc không tìm thấy, ẩn indicator
        if (activeTabIndex === -1 || tabs[activeTabIndex].isAction) {
            setIndicatorStyle({ width: 0, left: 0, opacity: 0 });
            return;
        }

        const activeTabElement = tabsRef.current[activeTabIndex];
        
        if (activeTabElement && navRef.current) {
            const navRect = navRef.current.getBoundingClientRect();
            const tabRect = activeTabElement.getBoundingClientRect();
            
            const width = tabRect.width - 20;
            const left = tabRect.left - navRect.left + 10;
            
            setIndicatorStyle({ width, left, opacity: 1 });
        }
    }, [activeTab]); 

    return (
        <div className="mobile-bottom-nav" ref={navRef}>
            <div className="nav-indicator" style={indicatorStyle}></div>

            {tabs.map((tab, index) => {
                if (tab.isAction) {
                    return (
                        <div key="action-btn" className="nav-item-container" ref={el => tabsRef.current[index] = el}>
                            <button className="nav-item action-btn" onClick={onOpenUpload}>
                                <span className="material-icons">add</span>
                            </button>
                        </div>
                    );
                }

                // Render các tab thường
                return (
                    <div 
                        key={tab.id} 
                        className="nav-item-container" 
                        ref={el => tabsRef.current[index] = el}
                    >
                        <button 
                            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`} 
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="material-icons">{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default MobileBottomNav;