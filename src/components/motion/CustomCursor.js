import { useEffect, useRef } from 'react';

const editableSelector = 'input, textarea, select, [contenteditable="true"]';
const lifetime = 720;

function supportsCustomCursor() {
  try {
    return Boolean(window.matchMedia
      && window.matchMedia('(hover: hover) and (pointer: fine)').matches
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      && window.PointerEvent
      && document.documentElement.classList);
  } catch {
    return false;
  }
}

export default function CustomCursor() {
  const canvasRef = useRef(null);
  const cursorRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const cursor = cursorRef.current;
    if (!canvas || !cursor || !supportsCustomCursor()) return undefined;

    const root = document.documentElement;
    const context = canvas.getContext('2d', { alpha: true });
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!context) return undefined;

    let active = true;
    let visible = false;
    let frame = 0;
    let previousTime = 0;
    let previousPoint = null;
    let expandedTarget = null;
    let pixelRatio = 1;
    const points = [];
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    const dotTau = 55;

    const setVisible = (value) => {
      visible = value;
      cursor.classList.toggle('is-visible', value);
      canvas.classList.toggle('is-visible', value);
    };

    const setExpanded = (value) => {
      cursor.classList.toggle('is-expanded', value);
    };

    const resize = () => {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.ceil(window.innerWidth * pixelRatio);
      canvas.height = Math.ceil(window.innerHeight * pixelRatio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const drawGlow = (x, y, radius, color) => {
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color.core);
      gradient.addColorStop(0.28, color.mid);
      gradient.addColorStop(1, 'rgba(120, 205, 235, 0)');
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    };

    const drawTrail = (time) => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const live = points.filter((point) => time - point.time < lifetime);
      points.length = 0;
      points.push(...live);
      if (!points.length) return false;

      context.save();
      context.globalCompositeOperation = 'lighter';
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.shadowColor = 'rgba(170, 235, 255, 0.2)';

      for (let i = 1; i < points.length; i += 1) {
        const previous = points[i - 1];
        const point = points[i];
        const age = Math.max(0, Math.min(1, (time - point.time) / lifetime));
        const energy = Math.max(0, 1 - age);
        const speed = Math.min(point.speed / 1800, 1);
        const width = (18 + speed * 32) * energy;
        if (width < 0.4) continue;
        context.strokeStyle = `rgba(145, 225, 255, ${0.18 * energy})`;
        context.lineWidth = width;
        context.shadowBlur = 28 * energy;
        context.beginPath();
        context.moveTo(previous.x, previous.y);
        const cx = (previous.x + point.x) / 2 - point.vy * 0.018;
        const cy = (previous.y + point.y) / 2 + point.vx * 0.018;
        context.quadraticCurveTo(cx, cy, point.x, point.y);
        context.stroke();
      }

      const newest = points[points.length - 1];
      const newestAge = Math.max(0, Math.min(1, (time - newest.time) / lifetime));
      const energy = Math.max(0, 1 - newestAge);
      const speed = Math.min(newest.speed / 1600, 1);
      const tailX = newest.x - newest.vx * 0.045;
      const tailY = newest.y - newest.vy * 0.045;
      drawGlow(tailX, tailY, (74 + speed * 72) * energy, {
        core: `rgba(180, 235, 255, ${0.16 * energy})`,
        mid: `rgba(105, 190, 220, ${0.1 * energy})`,
      });
      drawGlow(newest.x, newest.y, (70 + speed * 36) * energy, {
        core: `rgba(255, 255, 255, ${0.5 * energy})`,
        mid: `rgba(185, 245, 255, ${0.24 * energy})`,
      });
      drawGlow(newest.x, newest.y, (22 + speed * 18) * energy, {
        core: `rgba(255, 255, 255, ${0.78 * energy})`,
        mid: `rgba(210, 250, 255, ${0.38 * energy})`,
      });
      context.restore();
      return true;
    };

    const tick = (time) => {
      if (!active) return;
      const elapsed = previousTime ? time - previousTime : 16;
      previousTime = time;
      const alpha = 1 - Math.exp(-elapsed / dotTau);
      current.x += (target.x - current.x) * alpha;
      current.y += (target.y - current.y) * alpha;
      cursor.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;

      const hasTrail = drawTrail(time);
      if (visible || hasTrail) frame = window.requestAnimationFrame(tick);
      else {
        frame = 0;
        previousTime = 0;
      }
    };

    const start = () => {
      if (!frame) frame = window.requestAnimationFrame(tick);
    };

    const stop = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
    };

    const clearTrail = () => {
      points.length = 0;
      previousPoint = null;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };

    const deactivate = () => {
      active = false;
      stop();
      clearTrail();
      setVisible(false);
      setExpanded(false);
      root.classList.remove('custom-cursor-active');
      expandedTarget = null;
    };

    const onPreferenceChange = () => {
      if (reduceMotion.matches || !finePointer.matches) deactivate();
    };

    const pushPoint = (x, y, time) => {
      const elapsed = previousPoint ? Math.max(time - previousPoint.time, 16) : 16;
      const vx = previousPoint ? (x - previousPoint.x) / elapsed * 1000 : 0;
      const vy = previousPoint ? (y - previousPoint.y) / elapsed * 1000 : 0;
      const speed = Math.min(Math.hypot(vx, vy), 2200);
      const point = { x, y, vx, vy, speed, time };
      previousPoint = point;
      points.push(point);
      while (points.length > 32) points.shift();
    };

    const onPointerMove = (event) => {
      if (!active || event.pointerType !== 'mouse') return;
      const now = performance.now();
      target.x = event.clientX;
      target.y = event.clientY;
      if (!visible) {
        clearTrail();
        current.x = target.x;
        current.y = target.y;
        cursor.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;
        setVisible(true);
      }
      pushPoint(target.x, target.y, now);
      start();
    };

    const onPointerOver = (event) => {
      if (!active || event.pointerType !== 'mouse') return;
      const next = event.target.closest?.('[data-cursor="expand"]');
      if (!next || next.matches(editableSelector) || next.closest(editableSelector)) return;
      expandedTarget = next;
      setExpanded(true);
    };

    const onPointerOut = (event) => {
      if (!active || event.pointerType !== 'mouse' || !expandedTarget) return;
      if (expandedTarget.contains(event.relatedTarget)) return;
      expandedTarget = null;
      setExpanded(false);
    };

    const hide = () => {
      setVisible(false);
      setExpanded(false);
      expandedTarget = null;
      clearTrail();
      start();
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        hide();
        stop();
      }
    };

    try {
      resize();
      root.classList.add('custom-cursor-active');
      window.addEventListener('resize', resize);
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerover', onPointerOver, { passive: true });
      window.addEventListener('pointerout', onPointerOut, { passive: true });
      window.addEventListener('pointerleave', hide);
      window.addEventListener('blur', hide);
      document.addEventListener('visibilitychange', onVisibilityChange);
      reduceMotion.addEventListener('change', onPreferenceChange);
      finePointer.addEventListener('change', onPreferenceChange);
    } catch {
      deactivate();
    }

    return () => {
      active = false;
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerover', onPointerOver);
      window.removeEventListener('pointerout', onPointerOut);
      window.removeEventListener('pointerleave', hide);
      window.removeEventListener('blur', hide);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      reduceMotion.removeEventListener('change', onPreferenceChange);
      finePointer.removeEventListener('change', onPreferenceChange);
      stop();
      clearTrail();
      root.classList.remove('custom-cursor-active');
    };
  }, []);

  return <div className="custom-cursor-overlay" aria-hidden="true">
    <canvas ref={canvasRef} className="custom-cursor-trail" />
    <span ref={cursorRef} className="custom-cursor-dot" />
  </div>;
}
