import { useEffect, useRef } from 'react';
import './CoffeeLiquid.css';

type Point = {
  y: number;
  velocity: number;
};

type Bubble = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  phase: number;
};

const POINT_COUNT = 82;
const BUBBLE_COUNT = 34;

const CoffeeLiquid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let raf = 0;
    const points: Point[] = Array.from({ length: POINT_COUNT }, () => ({ y: 0, velocity: 0 }));
    const bubbles: Bubble[] = Array.from({ length: BUBBLE_COUNT }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      radius: 2 + Math.random() * 5,
      speed: 0.16 + Math.random() * 0.32,
      phase: index * 0.37,
    }));

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const disturb = (clientX: number, strength = 24) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      
      const cupW = Math.min(width * 0.62, 720);
      const cupX = width * 0.52 - cupW * 0.5;
      const left = cupX + cupW * 0.08;
      const right = cupX + cupW * 0.92;
      
      if (x < left || x > right) return;
      
      const index = Math.round(((x - left) / (right - left)) * (POINT_COUNT - 1));
      for (let i = -7; i <= 7; i += 1) {
        const point = points[index + i];
        if (!point) continue;
        const falloff = 1 - Math.abs(i) / 8;
        point.velocity += strength * falloff;
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        active: true,
      };
      disturb(event.clientX, 3.5);
    };

    const handlePointerLeave = () => {
      pointerRef.current.active = false;
    };

    const drawSteam = (time: number, cupX: number, cupY: number, cupW: number) => {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 6; i += 1) {
        const x = cupX + cupW * (0.28 + i * 0.09) + Math.sin(time * 0.0012 + i) * 16;
        const y = cupY - 130 - ((time * (0.018 + i * 0.002)) % 90);
        const alpha = (0.1 + Math.sin(time * 0.002 + i) * 0.035) * 0.6;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.moveTo(x, y + 76);
        ctx.bezierCurveTo(x - 22, y + 44, x + 24, y + 28, x, y);
        ctx.stroke();
      }
      ctx.restore();
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      const cupW = Math.min(width * 0.62, 720);
      const cupH = Math.min(height * 0.34, 260);
      const cupX = width * 0.52 - cupW * 0.5;
      const cupY = height * 0.6 - cupH * 0.2; // Lowered from 0.5 to 0.6
      const surfaceY = cupY + cupH * 0.25;
      const surfaceH = cupH * 0.22;
      const left = cupX + cupW * 0.08;
      const right = cupX + cupW * 0.92;
      const liquidBottom = cupY + cupH * 0.92;

      if (Math.floor(time / 2400) !== Math.floor((time - 16) / 2400)) {
        disturb(left + Math.random() * (right - left), 12 + Math.random() * 8);
      }

      for (let i = 0; i < points.length; i += 1) {
        const prev = points[i - 1]?.y ?? points[i].y;
        const next = points[i + 1]?.y ?? points[i].y;
        const spread = (prev + next - points[i].y * 2) * 0.08;
        const spring = -points[i].y * 0.04;
        points[i].velocity += spread + spring;
        points[i].velocity *= 0.92;
        points[i].y += points[i].velocity;
      }

      drawSteam(time, cupX, cupY, cupW);

      const saucerGradient = ctx.createRadialGradient(
        cupX + cupW * 0.5,
        liquidBottom + 40,
        10,
        cupX + cupW * 0.5,
        liquidBottom + 40,
        cupW * 0.6,
      );
      saucerGradient.addColorStop(0, 'rgba(60, 42, 33, 0.25)');
      saucerGradient.addColorStop(1, 'rgba(60, 42, 33, 0)');
      ctx.fillStyle = saucerGradient;
      ctx.beginPath();
      ctx.ellipse(cupX + cupW * 0.5, liquidBottom + 40, cupW * 0.55, 32, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(245, 235, 224, 0.44)';
      ctx.strokeStyle = 'rgba(60, 42, 33, 0.14)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cupX, cupY + 8, cupW, cupH, 42);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = 'rgba(60, 42, 33, 0.12)';
      ctx.lineWidth = 28;
      ctx.beginPath();
      ctx.arc(cupX + cupW + 24, cupY + cupH * 0.45, cupH * 0.28, -Math.PI * 0.65, Math.PI * 0.65);
      ctx.stroke();

      ctx.save();
      ctx.beginPath();
      // Expanded clipping to cover liquid bottom
      ctx.roundRect(cupX + cupW * 0.06, cupY + cupH * 0.08, cupW * 0.88, cupH * 0.86, 32);
      ctx.clip();

      const liquidGradient = ctx.createLinearGradient(0, surfaceY - 80, 0, liquidBottom);
      liquidGradient.addColorStop(0, '#6b3f25');
      liquidGradient.addColorStop(0.46, '#3b2115');
      liquidGradient.addColorStop(1, '#170d08');
      ctx.fillStyle = liquidGradient;
      ctx.beginPath();
      ctx.moveTo(left, surfaceY);
      for (let i = 0; i < points.length; i += 1) {
        const t = i / (points.length - 1);
        const x = left + t * (right - left);
        const baseWave = Math.sin(time * 0.001 + t * Math.PI * 2) * 2;
        const y = surfaceY + points[i].y + baseWave;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(right, liquidBottom);
      ctx.lineTo(left, liquidBottom);
      ctx.closePath();
      ctx.fill();

      ctx.globalCompositeOperation = 'screen';
      for (const bubble of bubbles) {
        bubble.y -= bubble.speed / Math.max(height, 1);
        if (bubble.y < 0) {
          bubble.y = 1;
          bubble.x = Math.random();
        }
        const x = left + bubble.x * (right - left) + Math.sin(time * 0.001 + bubble.phase) * 14;
        const y = surfaceY + bubble.y * (liquidBottom - surfaceY);
        const bubbleAlpha = Math.min(bubble.y * 2, 0.18);
        ctx.beginPath();
        ctx.fillStyle = `rgba(231, 188, 145, ${bubbleAlpha})`;
        ctx.arc(x, y, bubble.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      const shine = ctx.createLinearGradient(left, surfaceY - 18, right, surfaceY + 24);
      shine.addColorStop(0, 'rgba(255,255,255,0.25)');
      shine.addColorStop(0.32, 'rgba(231,188,145,0.15)');
      shine.addColorStop(1, 'rgba(255,255,255,0.03)');
      ctx.strokeStyle = shine;
      ctx.lineWidth = 8;
      ctx.beginPath();
      for (let i = 0; i < points.length; i += 1) {
        const t = i / (points.length - 1);
        const x = left + t * (right - left);
        const y = surfaceY + points[i].y + Math.sin(time * 0.001 + t * Math.PI * 2) * 2 - 1;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.restore();

      // Rim highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cupX + cupW * 0.5, cupY + 8, cupW * 0.5, 12, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(245, 235, 224, 0.24)';
      ctx.beginPath();
      ctx.ellipse(cupX + cupW * 0.5, surfaceY + 2, cupW * 0.43, surfaceH, 0, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  return (
    <div ref={wrapRef} className="coffee-liquid">
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
};

export default CoffeeLiquid;
