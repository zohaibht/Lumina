
import React from 'react';
import { DesignStyle } from '../types';

interface StyleCarouselProps {
  onSelect: (style: DesignStyle) => void;
  selectedStyle: DesignStyle | null;
  isGenerating: boolean;
}

const styles = [
  { name: DesignStyle.MID_CENTURY_MODERN, icon: "🏺", desc: "Warm wood & clean lines" },
  { name: DesignStyle.SCANDINAVIAN, icon: "❄️", desc: "Light, airy & functional" },
  { name: DesignStyle.INDUSTRIAL, icon: "🏗️", desc: "Raw materials & open space" },
  { name: DesignStyle.MINIMALIST, icon: "⚪", desc: "Pure simplicity & focus" },
  { name: DesignStyle.BOHEMIAN, icon: "🌿", desc: "Eclectic, artistic & natural" },
  { name: DesignStyle.JAPANDI, icon: "🎍", desc: "East meets West Zen" },
  { name: DesignStyle.CONTEMPORARY, icon: "🏢", desc: "Sleek, current & trendy" },
  { name: DesignStyle.RUSTIC, icon: "🪵", desc: "Natural, aged & cozy" },
  { name: DesignStyle.ART_DECO, icon: "💎", desc: "Glamorous & geometric" },
  { name: DesignStyle.FARMHOUSE, icon: "🏠", desc: "Rustic, cozy & white" },
];

const StyleCarousel: React.FC<StyleCarouselProps> = ({ onSelect, selectedStyle, isGenerating }) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
        <span className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">✨</span>
        Choose Your Style
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {styles.map((s) => (
          <button
            key={s.name}
            onClick={() => !isGenerating && onSelect(s.name)}
            disabled={isGenerating}
            className={`flex-shrink-0 w-36 h-44 p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center gap-2
              ${selectedStyle === s.name 
                ? 'border-indigo-600 bg-indigo-50 shadow-md ring-2 ring-indigo-600/20' 
                : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm'
              }
              ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className="text-4xl mb-2">{s.icon}</span>
            <span className="font-bold text-sm text-slate-800 leading-tight">{s.name}</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{s.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StyleCarousel;
