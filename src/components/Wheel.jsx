import React, { useRef, useEffect } from 'react';
import { sounds } from '../utils/sounds';

const COLORS = [
  '#6366f1', '#ec4899', '#10b981', '#f59e0b', 
  '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'
];

const Wheel = ({ options, spinning, onFinished, winningIndex }) => {
  const canvasRef = useRef(null);
  const rotationRef = useRef(0);
  const lastTickIndexRef = useRef(-1);
  const velocityRef = useRef(0);
  const requestRef = useRef();

  const draw = (currentRotation) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, width, height);

    if (options.length === 0) {
      // Draw empty wheel
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText('Add options to start', centerX, centerY);
      return;
    }

    const sliceAngle = (2 * Math.PI) / options.length;

    options.forEach((option, i) => {
      const startAngle = i * sliceAngle + currentRotation;
      const endAngle = startAngle + sliceAngle;

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();

      // Inner shadow/glow effect
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.2)');
      ctx.fillStyle = gradient;
      ctx.fill();

      // White indicator line
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Outfit';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(option.length > 15 ? option.substring(0, 12) + '...' : option, radius - 30, 6);
      ctx.restore();
    });

    // Draw center circle (hub)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw pointer (triangle)
    ctx.beginPath();
    ctx.moveTo(width - 5, centerY);
    ctx.lineTo(width - 25, centerY - 15);
    ctx.lineTo(width - 25, centerY + 15);
    ctx.closePath();
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  useEffect(() => {
    draw(rotationRef.current);
  }, [options]);

  useEffect(() => {
    if (spinning) {
      const spinDuration = 4000 + Math.random() * 2000;
      const startTime = Date.now();
      const initialVelocity = 0.5 + Math.random() * 0.5;
      
      // Calculate target rotation to land on the winner
      // winIndex is the index we want to land on at the pointer (0 rad, or width side)
      // The pointer is at 0 radians (3 o'clock position on canvas usually)
      const sliceAngle = (2 * Math.PI) / options.length;
      
      // We want slice [winningIndex] to be at angle 0.
      // Current angle of slice i center is: i * sliceAngle + rotation
      // So we want: winningIndex * sliceAngle + totalRotation = 0 (mod 2pi)
      // totalRotation = -winningIndex * sliceAngle
      
      const totalRevolutions = 10 + Math.floor(Math.random() * 10);
      const targetRotation = (2 * Math.PI * totalRevolutions) - (winningIndex * sliceAngle) - (sliceAngle / 2);

      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        
        // Easing out quintic
        const easedProgress = 1 - Math.pow(1 - progress, 4);
        const currentRotation = easedProgress * targetRotation;
        
        // Sound logic
        const sliceAngle = (2 * Math.PI) / options.length;
        const normalizedRotation = currentRotation % (2 * Math.PI);
        const currentIndex = Math.floor(((2 * Math.PI - normalizedRotation) % (2 * Math.PI)) / sliceAngle);
        
        if (currentIndex !== lastTickIndexRef.current) {
          sounds.playTick();
          lastTickIndexRef.current = currentIndex;
        }

        rotationRef.current = currentRotation;
        draw(currentRotation);

        if (progress < 1) {
          requestRef.current = requestAnimationFrame(animate);
        } else {
          onFinished();
        }
      };

      requestRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [spinning]);

  return (
    <div className="relative flex justify-center items-center w-full max-w-[500px] aspect-square mx-auto">
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="w-full h-full drop-shadow-2xl"
      />
    </div>
  );
};

export default Wheel;
