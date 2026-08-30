import React, { useEffect, useRef } from 'react';

export default function AudioVisualizer({ isRecording, analyser, mode = 'bars' }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (isRecording && analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        if (mode === 'bars') {
          analyser.getByteFrequencyData(dataArray);
          const barWidth = (width / bufferLength) * 2.5;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * (height * 0.85);

            // Glowing gradient
            const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
            gradient.addColorStop(0, '#f43f5e'); // Neon Rose
            gradient.addColorStop(0.5, '#a855f7'); // Violet
            gradient.addColorStop(1, '#06b6d4'); // Cyan

            ctx.fillStyle = gradient;
            ctx.shadowBlur = 12;
            ctx.shadowColor = 'rgba(244, 63, 94, 0.6)';
            
            // Rounded bars
            ctx.beginPath();
            ctx.roundRect(x, height - barHeight, barWidth - 2, barHeight, [4, 4, 0, 0]);
            ctx.fill();

            x += barWidth + 1;
          }
        } else {
          // Sine Wave Oscilloscope Mode
          analyser.getByteTimeDomainData(dataArray);
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#38bdf8';
          ctx.shadowBlur = 16;
          ctx.shadowColor = '#0284c7';
          ctx.beginPath();

          const sliceWidth = width / bufferLength;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * height) / 2;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
            x += sliceWidth;
          }
          ctx.lineTo(width, height / 2);
          ctx.stroke();
        }
      } else {
        // Idle Ambient Floating Sine Wave
        phase += 0.04;
        ctx.lineWidth = 2.5;
        
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
        gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.8)');
        gradient.addColorStop(1, 'rgba(168, 85, 247, 0.2)');
        
        ctx.strokeStyle = gradient;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';
        ctx.beginPath();

        const points = 80;
        for (let i = 0; i <= points; i++) {
          const x = (i / points) * width;
          const y = height / 2 + Math.sin(i * 0.15 + phase) * 16 * Math.sin(phase * 0.5);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Secondary gentle harmonic
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
          const x = (i / points) * width;
          const y = height / 2 + Math.cos(i * 0.12 - phase * 0.8) * 10;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording, analyser, mode]);

  return (
    <div className="relative w-full h-24 rounded-2xl overflow-hidden bg-slate-950/60 border border-slate-800/80 shadow-inner flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={600}
        height={96}
        className="w-full h-full object-cover"
      />
      {isRecording && (
        <div className="absolute top-2 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-semibold tracking-wider uppercase backdrop-blur-md animate-pulse">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          LIVE SPECTRUM
        </div>
      )}
    </div>
  );
}
