import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Undo, Send, X } from 'lucide-react';

interface StudentDrawingPadProps {
  onSend: (dataUrl: string) => void;
  onClose: () => void;
}

export function StudentDrawingPad({ onSend, onClose }: StudentDrawingPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [lines, setLines] = useState<ImageData[]>([]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      // Set fixed resolution for drawing, visually scaled by CSS
      canvas.width = 600;
      canvas.height = 400;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.lineWidth = 4;
        context.strokeStyle = '#2563eb';
        // Fill white background
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        setCtx(context);
        // Save initial state
        setLines([context.getImageData(0, 0, canvas.width, canvas.height)]);
      }
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return null;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Scale coordinates based on actual rendering size vs internal resolution
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!ctx) return;
    const coords = getCoordinates(e);
    if (coords) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !ctx) return;
    const coords = getCoordinates(e);
    if (coords) {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing && ctx && canvasRef.current) {
      setIsDrawing(false);
      ctx.closePath();
      // Save state for undo
      setLines([...lines, ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height)]);
    }
  };

  const undo = () => {
    if (lines.length > 1 && ctx && canvasRef.current) {
      const newLines = lines.slice(0, -1);
      setLines(newLines);
      ctx.putImageData(newLines[newLines.length - 1], 0, 0);
    }
  };

  const submit = () => {
    if (canvasRef.current) {
      onSend(canvasRef.current.toDataURL('image/png'));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col p-4 sm:p-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white/90 backdrop-blur-xl rounded-t-3xl p-6 shadow-sm border-b border-slate-200/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shadow-inner">
            <PenTool className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-slate-800 tracking-tight text-xl">Tekenen voor het bord</h2>
        </div>
        <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors active:scale-95">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-1 bg-slate-50/90 backdrop-blur-sm relative w-full h-full flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="bg-white shadow-xl rounded-2xl max-w-full max-h-full w-auto h-auto touch-none border border-slate-200/50"
          style={{ aspectRatio: '600/400' }}
        />
      </div>
      
      <div className="bg-white/90 backdrop-blur-xl p-6 rounded-b-3xl shadow-lg border-t border-slate-200/50 flex justify-between gap-4">
        <button 
          onClick={undo}
          disabled={lines.length <= 1}
          className="flex flex-col items-center justify-center py-3 px-6 text-slate-500 disabled:opacity-50 hover:bg-slate-100 hover:text-slate-800 rounded-2xl transition-colors"
        >
          <Undo className="w-6 h-6 mb-1" />
          <span className="text-xs font-bold uppercase tracking-widest">Wissen</span>
        </button>
        
        <button 
          onClick={submit}
          className="flex-1 flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-4 px-6 font-bold transition-all shadow-md shadow-indigo-500/20 active:translate-y-0.5 hover:-translate-y-0.5 text-lg"
        >
          <Send className="w-6 h-6" />
          Naar digibord
        </button>
      </div>
    </div>
  );
}
