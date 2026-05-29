import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export function FastTooltip({ children, content, position = 'right' }: { children: React.ReactNode, content: string, position?: 'right' | 'bottom' | 'top' }) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      let top = 0;
      let left = 0;
      
      if (position === 'right') {
        top = rect.top;
        left = rect.right + 8;
      } else if (position === 'bottom') {
        top = rect.bottom + 8;
        left = rect.left + (rect.width / 2);
      } else if (position === 'top') {
         top = rect.top - 8;
         left = rect.left + (rect.width / 2);
      }
      
      setCoords({ top, left });
    }
  }, [isVisible, position]);

  return (
    <>
      <div 
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="w-full h-full flex"
      >
        {children}
      </div>
      {isVisible && createPortal(
        <div 
          className={`fixed z-[100] px-2 py-1.5 bg-slate-800 text-slate-200 text-[10px] font-medium leading-tight rounded-sm border border-slate-700 shadow-xl pointer-events-none max-w-[200px] animate-in fade-in duration-100 ${position === 'bottom' || position === 'top' ? 'transform -translate-x-1/2' : ''} ${position === 'top' ? 'transform -translate-y-full -translate-x-1/2' : ''}`}
          style={{ top: coords.top, left: coords.left }}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
}
