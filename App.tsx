import React, { useState, useEffect } from 'react';
import ImageInput from './components/ImageInput';
import StyleCarousel from './components/StyleCarousel';
import CompareSlider from './components/CompareSlider';
import ChatInterface from './components/ChatInterface';
import { DesignStyle, SavedDesign } from './types';
import { generateReimaginedDesign, editDesign } from './services/geminiService';

const STORAGE_KEY = 'lumina_saved_designs';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [modifiedImage, setModifiedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedDesigns(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse saved designs", e);
      }
    }
  }, []);

  const handleImageInput = (base64: string) => {
    setOriginalImage(base64);
    setModifiedImage(null);
    setSelectedStyle(null);
    setError(null);
  };

  const handleStyleSelect = async (style: DesignStyle) => {
    if (!originalImage || isGenerating) return;
    
    setSelectedStyle(style);
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateReimaginedDesign(originalImage, style);
      if (result) {
        setModifiedImage(result);
      } else {
        setError("Failed to generate design. Please try again.");
      }
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditRequested = async (instruction: string) => {
    const baseImage = modifiedImage || originalImage;
    if (!baseImage || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    try {
      const result = await editDesign(baseImage, instruction);
      if (result) {
        setModifiedImage(result);
      }
    } catch (e: any) {
      setError(e.message || "Edit failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDesign = () => {
    if (!originalImage || !modifiedImage || !selectedStyle) return;
    const newSaved: SavedDesign = {
      id: Date.now().toString(),
      originalImage,
      modifiedImage,
      style: selectedStyle,
      timestamp: Date.now()
    };
    const updated = [newSaved, ...savedDesigns];
    setSavedDesigns(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 selection:bg-indigo-100">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 px-6 mb-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
              Lumina <span className="text-indigo-600 font-light">Space</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {!originalImage ? (
              <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100 text-center space-y-10 animate-in fade-in duration-700">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight font-display">Reimagine your space</h2>
                  <p className="text-slate-500 text-lg">Upload a photo to see it reborn in beautiful professional styles.</p>
                </div>
                <ImageInput onImageSelected={handleImageInput} />
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold font-display text-slate-800">Design Studio</h2>
                  <div className="flex gap-2">
                    {modifiedImage && (
                      <button 
                        onClick={handleSaveDesign}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
                      >
                        Save Design
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setOriginalImage(null);
                        setModifiedImage(null);
                      }}
                      className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                    >
                      New Photo
                    </button>
                  </div>
                </div>

                <div className="relative group">
                  {isGenerating && (
                    <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                      <h4 className="text-xl font-bold font-display text-slate-900 tracking-tight">Rendering your {selectedStyle} vision</h4>
                      <p className="text-slate-500 text-sm mt-2 max-w-xs">Our AI is re-decorating your room using advanced vision capabilities.</p>
                    </div>
                  )}

                  {modifiedImage ? (
                    <CompareSlider original={originalImage} modified={modifiedImage} />
                  ) : (
                    <div className="w-full aspect-video md:aspect-[16/9] bg-slate-200 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                      <img src={originalImage} alt="Original Space" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <StyleCarousel 
                  onSelect={handleStyleSelect} 
                  selectedStyle={selectedStyle} 
                  isGenerating={isGenerating} 
                />

                {error && (
                  <div className="p-5 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-medium flex items-start gap-3">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-bold">Design Generation Error</p>
                      <p className="opacity-90">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <ChatInterface 
              currentImage={modifiedImage || originalImage} 
              onEditRequested={handleEditRequested}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;