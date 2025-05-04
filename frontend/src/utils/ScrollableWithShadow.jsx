import { useRef, useState } from 'react';

export default function ScrollableWithShadow({ children, className = '', height = '80vh' }) {
  const contentRef = useRef(null);
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);

  const handleScroll = (el) => {
    if (!el) return;
    setShowTopShadow(el.scrollTop > 0);
    setShowBottomShadow(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
  };

  const onScroll = (e) => handleScroll(e.target);

  return (
    <div className="relative" style={{ height }}>
      <div
        ref={(el) => {
          contentRef.current = el;
          handleScroll(el);
        }}
        className={`note-content ${className}`}
        onScroll={onScroll}
      >
        {children}
      </div>

      {showTopShadow && (
        <div className="scroll-shadow-top" />
      )}

      {showBottomShadow && (
        <div className="scroll-shadow-bottom" />
      )}
    </div>
  );
}