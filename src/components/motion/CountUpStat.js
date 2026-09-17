import { useEffect, useRef, useState } from 'react';

export default function CountUpStat({ value, enabled = true }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const match = /^(\d{3,})(\+?)$/.exec(value);
    if (!enabled || !match || !window.IntersectionObserver || !window.matchMedia) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) return undefined;
    const target = Number(match[1]);
    const suffix = match[2];
    let frame;
    let started = false;
    let startTime;
    let observer;
    const finish = () => {
      started = true;
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      setDisplay(value);
    };
    const tick = (time) => {
      if (startTime === undefined) startTime = time;
      const progress = Math.min((time - startTime) / 2200, 1);
      // Fast at first, then ease into the exact final total.
      const count = Math.min(target, Math.floor(1 + (target - 1) * (1 - Math.pow(1 - progress, 3))));
      setDisplay(`${count}${suffix}`);
      if (progress < 1) frame = window.requestAnimationFrame(tick);
      else finish();
    };
    try {
      observer = new IntersectionObserver((entries) => {
        if (started || !entries.some((entry) => entry.isIntersecting)) return;
        started = true;
        observer.disconnect();
        frame = window.requestAnimationFrame(tick);
      }, { threshold: 0.5, rootMargin: '0px 0px -64px 0px' });
      setDisplay(`1${suffix}`);
      observer.observe(ref.current);
      reduced.addEventListener('change', finish);
    } catch { finish(); }
    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      reduced.removeEventListener('change', finish);
    };
  }, [value, enabled]);

  return <strong ref={ref} className="stat-value">
    <span className="stat-readable">{value}</span>
    <span className="stat-count" aria-hidden="true">{display}</span>
  </strong>;
}
