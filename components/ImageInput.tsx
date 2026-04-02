
import React, { useState, useRef, useCallback } from 'react';

interface ImageInputProps {
  onImageSelected: (base64: string) => void;
}

const ImageInput: React.FC<ImageInputProps> = ({ onImageSelected }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/png');
        stopCamera();
        onImageSelected(base64);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onImageSelected(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (isCameraActive) {
    return (
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden aspect-video md:aspect-[16/9] shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white text-[10px] font-bold rounded-full uppercase tracking-widest animate-pulse">
          <span className="w-2 h-2 bg-white rounded-full"></span>
          Live Camera
        </div>
        <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6">
          <button 
            onClick={stopCamera}
            className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
            title="Cancel"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <button 
            onClick={capturePhoto}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all group"
            title="Capture Photo"
          >
            <div className="w-16 h-16 border-4 border-slate-900 rounded-full flex items-center justify-center group-hover:bg-slate-50">
               <div className="w-12 h-12 bg-indigo-600 rounded-full"></div>
            </div>
          </button>

          <div className="w-14 h-14"></div> {/* Spacer for balance */}
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Upload Box */}
      <div 
        onDragOver={onDragOver}
        onDrop={onDrop}
        className="group relative border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50 rounded-3xl p-10 transition-all cursor-pointer overflow-hidden flex flex-col items-center text-center justify-center min-h-[280px]"
      >
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors mb-4">
          <svg className="w-7 h-7 text-slate-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <div className="space-y-1">
          <p className="text-lg font-bold text-slate-900">Upload Photo</p>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-tight">JPG, PNG or WEBP</p>
        </div>
      </div>

      {/* Camera Box */}
      <button 
        onClick={startCamera}
        className="group relative border-2 border-slate-100 bg-white hover:border-indigo-500 hover:bg-indigo-50/50 rounded-3xl p-10 transition-all flex flex-col items-center text-center justify-center min-h-[280px] shadow-sm"
      >
        <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors mb-4">
          <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="space-y-1">
          <p className="text-lg font-bold text-slate-900">Take Photo</p>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-tight">Use your camera directly</p>
        </div>
      </button>
    </div>
  );
};

export default ImageInput;
