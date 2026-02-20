import React, { useState } from 'react';
import Modal from '../Modal';

const FilterModal = ({ isOpen, onClose, onApply }) => {
  const [maxCal, setMaxCal] = useState('');
  const [maxTime, setMaxTime] = useState('');
  const [ingredient, setIngredient] = useState('');

  const handleApply = () => {
    onApply({ maxCal, maxTime, ingredient });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⚙️ Bộ lọc món ăn">
      <div className="modal-body">
        <div className="filter-input-group">
          <label className="filter-label">Calories tối đa (kcal)</label>
          <input type="number" placeholder="Ví dụ: 500" className="filter-input" value={maxCal} onChange={(e) => setMaxCal(e.target.value)} />
        </div>

        <div className="filter-input-group">
          <label className="filter-label">Thời gian nấu tối đa (phút)</label>
          <input type="number" placeholder="Ví dụ: 30" className="filter-input" value={maxTime} onChange={(e) => setMaxTime(e.target.value)} />
        </div>
        
        <div className="filter-input-group">
          <label className="filter-label">Nguyên liệu (tên nguyên liệu)</label>
          <input type="text" placeholder="Ví dụ: thịt bò, tôm..." className="filter-input" value={ingredient} onChange={(e) => setIngredient(e.target.value)} />
        </div>

        <div className="filter-footer">
          <button onClick={onClose} className="btn-filter-cancel">Hủy bỏ</button>
          <button onClick={handleApply} className="btn-filter-apply">Áp dụng</button>
        </div>
      </div>
    </Modal>
  );
};
export default FilterModal;