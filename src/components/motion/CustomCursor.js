import { useEffect, useRef } from 'react';

const editableSelector = 'input, textarea, select, [contenteditable="true"]';

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
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || !supportsCustomCursor()) return undefined;

    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let active = true;
    let visible = false;
    let expandedTarget = null;
    let frame = 0;
    let previousTime = 0;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    const tau = 95;

    const setVisible = (value) => {
      visible = value;
      cursor.classList.toggle('is-visible', value);
    };

    const setExpanded = (value) => {
      cursor.classList.toggle('is-expanded', value);
    };

    const tick = (time) => {
      if (!active) return;
      const elapsed = previousTime ? time - previousTime : 16;
      previousTime = time;
      const alpha = 1 - Math.exp(-elapsed / tau);
      current.x += (target.x - current.x) * alpha;
      current.y += (target.y - current.y) * alpha;
      cursor.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;
      frame = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (!frame) frame = window.requestAnimationFrame(tick);
    };

    const stop = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
    };

    const deactivate = () => {
      active = false;
      stop();
      setVisible(false);
      setExpanded(false);
      root.classList.remove('custom-cursor-active');
      expandedTarget = null;
    };

    const onPreferenceChange = () => {
      if (reduceMotion.matches || !finePointer.matches) deactivate();
    };

    const onPointerMove = (event) => {
      if (!active || event.pointerType !== 'mouse') return;
      target.x = event.clientX;
      target.y = event.clientY;
      if (!visible) {
        current.x = target.x;
        current.y = target.y;
        cursor.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;
        setVisible(true);
      }
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
    };

    const onVisibilityChange = () => {
      if (document.hidden) hide();
    };

    try {
      root.classList.add('custom-cursor-active');
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
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerover', onPointerOver);
      window.removeEventListener('pointerout', onPointerOut);
      window.removeEventListener('pointerleave', hide);
      window.removeEventListener('blur', hide);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      reduceMotion.removeEventListener('change', onPreferenceChange);
      finePointer.removeEventListener('change', onPreferenceChange);
      stop();
      root.classList.remove('custom-cursor-active');
    };
  }, []);

  return <div className="custom-cursor-overlay" aria-hidden="true">
    <span ref={cursorRef} className="custom-cursor-dot" />
  </div>;
}
