import React, { useState, useEffect, useRef } from 'react';

const Navbar = ({ onSearch, onOpenFilter }) => {
  const [keyword, setKeyword] = useState("");
  const isMounted = useRef(false); 

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(keyword); 
    }
  };

  useEffect(() => {
    if (!isMounted.current) {
        isMounted.current = true;
        return;
    }

    const delayDebounceFn = setTimeout(() => {
      onSearch(keyword);
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [keyword]); 

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