/* 자세히보기 창 */
import React, { useState } from 'react';
import '../styles/DetailView.css';

const DetailView: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="detail-view-wrapper">
      {/* 예비(on/off) 버튼 */}
      <button className="open-button" onClick={() => setIsOpen(true)}>
        자세히보기
      </button>

      {isOpen && (
        <div className="view-overlay" onClick={() => setIsOpen(false)}>
          <div className="view-content" onClick={(e) => e.stopPropagation()}>
            <div className="view-header">
              <h3>상세정보 </h3>
              <button className="close-x-button" onClick={() => setIsOpen(false)}>×</button>
            </div>
            <div className="view-body">
              <p>내용</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailView;