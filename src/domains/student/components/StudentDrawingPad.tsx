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
    <div className="fixed inset-0 z-50 bg-gray-900/90 backdrop-blur-sm flex flex-col p-4">
      <div className="flex justify-between items-center bg-white rounded-t-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <PenTool className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-gray-900">Tekenen voor het bord</h2>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-1 bg-gray-100 relative w-full h-full flex items-center justify-center p-2">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="bg-white shadow-md rounded-lg max-w-full max-h-full w-auto h-auto touch-none"
          style={{ aspectRatio: '600/400' }}
        />
      </div>
      
      <div className="bg-white p-4 rounded-b-2xl shadow-lg border-t flex justify-between gap-4">
        <button 
          onClick={undo}
          disabled={lines.length <= 1}
          className="flex flex-col items-center justify-center py-2 px-4 text-gray-600 disabled:opacity-50 hover:bg-gray-100 rounded-xl"
        >
          <Undo className="w-5 h-5 mb-1" />
          <span className="text-xs font-semibold">Wis laatste</span>
        </button>
        
        <button 
          onClick={submit}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 px-4 font-bold transition-all shadow-md active:scale-95"
        >
          <Send className="w-5 h-5" />
          Naar digibord
        </button>
      </div>
    </div>
  );
}
