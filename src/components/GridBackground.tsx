import React, { useEffect, useRef } from 'react';

const GridBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let squares: { x: number, y: number, opacity: number, targetOpacity: number, speed: number }[] = [];
    
    const squareSize = 50; // Size of each grid square
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initSquares();
    };

    const initSquares = () => {
      squares = [];
      const cols = Math.ceil(canvas.width / squareSize);
      const rows = Math.ceil(canvas.height / squareSize);
      
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          squares.push({
            x: i * squareSize,
            y: j * squareSize,
            opacity: 0,
            targetOpacity: 0,
            speed: Math.random() * 0.01 + 0.005
          });
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw squares
      squares.forEach(sq => {
        // Randomly decide to light up a square
        if (Math.random() < 0.0005 && sq.targetOpacity === 0) {
          sq.targetOpacity = Math.random() * 0.04 + 0.01; // Subtle opacity
        }
        
        // Randomly decide to fade out a square
        if (Math.random() < 0.002 && sq.targetOpacity > 0) {
          sq.targetOpacity = 0;
        }

        // Animate opacity
        if (sq.opacity < sq.targetOpacity) {
          sq.opacity = Math.min(sq.opacity + sq.speed, sq.targetOpacity);
        } else if (sq.opacity > sq.targetOpacity) {
          sq.opacity = Math.max(sq.opacity - sq.speed, sq.targetOpacity);
        }

        // Draw the square if it has opacity
        if (sq.opacity > 0) {
          ctx.fillStyle = `rgba(0, 0, 0, ${sq.opacity})`;
          ctx.fillRect(sq.x, sq.y, squareSize, squareSize);
        }
      });

      // Draw grid lines
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.lineWidth = 1;
      
      const cols = Math.ceil(canvas.width / squareSize);
      const rows = Math.ceil(canvas.height / squareSize);
      
      for (let i = 0; i <= cols; i++) {
        ctx.moveTo(i * squareSize, 0);
        ctx.lineTo(i * squareSize, canvas.height);
      }
      for (let j = 0; j <= rows; j++) {
        ctx.moveTo(0, j * squareSize);
        ctx.lineTo(canvas.width, j * squareSize);
      }
      ctx.stroke();

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none bg-[#FAFAFA]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      {/* Colorful gradient at the bottom similar to the screenshot */}
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-blue-400/20 via-purple-400/20 to-transparent blur-3xl mix-blend-multiply"></div>
      <div className="absolute -bottom-48 -left-48 w-[40rem] h-[40rem] bg-blue-400/30 rounded-full blur-3xl mix-blend-multiply"></div>
      <div className="absolute -bottom-48 -right-48 w-[40rem] h-[40rem] bg-purple-400/30 rounded-full blur-3xl mix-blend-multiply"></div>
    </div>
  );
};

export default GridBackground;
