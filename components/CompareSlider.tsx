import React, { useState, useRef } from 'react';

interface CompareSliderProps {
  original: string;
  modified: string;
}

const CompareSlider: React.FC<CompareSliderProps> = ({ original, modified }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      setSliderPos((x / rect.width) * 100);
    }
  };

  const onMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video md:aspect-[16/9] bg-slate-200 rounded-2xl overflow-hidden cursor-ew-resize select-none border-4 border-white shadow-2xl"
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
    >
      {/* After Image (Full background) */}
      <img 
        src={modified} 
        alt="Modified Room" 
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Before Image (Clipped overlay) */}
      <div 
        className="absolute inset-0 overflow-hidden border-r-2 border-white/50 z-10"
        style={{ width: `${sliderPos}%` }}
      >
        <img 
          src={original} 
          alt="Original Room" 
          className="absolute inset-0 h-full object-cover pointer-events-none"
          style={{ width: containerRef.current?.offsetWidth || '100vw', maxWidth: 'none' }}
        />
      </div>

      {/* Labels */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-full font-bold tracking-widest z-20">ORIGINAL</div>
      <div className="absolute bottom-4 right-4 bg-indigo-600/80 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-full font-bold tracking-widest z-20">REIMAGINED</div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.5)] pointer-events-none z-20"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl border-2 border-indigo-500 text-indigo-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7l-5 5m0 0l5 5m-5-5h18m-5-5l5 5m0 0l-5 5" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CompareSlider;