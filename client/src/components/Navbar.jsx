import React, { useState, useEffect, useRef } from 'react';

const Navbar = ({ onSearch, onOpenFilter }) => {
  const [keyword, setKeyword] = useState("");
  const isMounted = useRef(false); // Cờ theo dõi lần render đầu tiên

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(keyword); 
    }
  };

  useEffect(() => {
    // NGĂN CHẶN chặn lần chạy đầu tiên khi trang vừa load
    if (!isMounted.current) {
        isMounted.current = true;
        return;
    }

    const delayDebounceFn = setTimeout(() => {
      onSearch(keyword);
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [keyword]); // Lưu ý: Chỉ theo dõi biến keyword

  return (
    <div className="header">
      <div className="search-bar">
        <span>🔍</span>
        <input 
            type="text" 
            placeholder="Tìm kiếm món ăn ngon..." 
            value={keyword} 
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown} 
        />
      </div>
      <div className="filter-btn cursor-pointer" onClick={onOpenFilter}>⚙️ Bộ Lọc</div>
    </div>
  );
};

export default Navbar;