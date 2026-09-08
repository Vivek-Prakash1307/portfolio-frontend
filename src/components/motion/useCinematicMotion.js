import { useEffect } from 'react';
import { choreography, easing, revealFrames, stagger } from './motion';

export default function useCinematicMotion(rootRef, enabled) {
  useEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root || !window.matchMedia || !window.IntersectionObserver || !Element.prototype.animate) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const compact = window.matchMedia('(max-width: 820px)');
    const visited = new WeakSet();
    const recipes = new WeakMap();
    const animations = new Map();
    let disposed = false;
    let frame;
    let observer;
    let mutations;
    let resize;
    const cancelAll = () => { animations.forEach((animation) => animation.cancel()); animations.clear(); };
    const resetDepth = () => {
      root.querySelectorAll('[data-depth]').forEach((element) => element.style.removeProperty('translate'));
      root.querySelector('.timeline')?.style.removeProperty('--journey-progress');
      root.querySelectorAll('.timeline-item').forEach((element) => element.removeAttribute('data-passed'));
    };
    const failOpen = () => {
      observer?.disconnect(); mutations?.disconnect(); resize?.disconnect(); cancelAll(); resetDepth();
      root.classList.remove('cinematic-ready');
    };
    const reveal = (element) => {
      if (visited.has(element)) return;
      visited.add(element);
      observer?.unobserve(element);
      if (reduced.matches || element.contains(document.activeElement)) return;
      const { kind, delay } = recipes.get(element);
      const major = ['heading', 'circle', 'wipe', 'image', 'project'].includes(kind);
      const animation = element.animate(revealFrames(compact.matches && ['circle', 'wipe'].includes(kind) ? 'fade' : kind, compact.matches), {
        duration: major ? 1100 : 650, delay, easing, fill: 'backwards',
      });
      animations.set(element, animation);
      // No forward fill: completed effects release their styles and hover transforms.
      animation.finished.then(() => { if (animations.get(element) === animation) animations.delete(element); }).catch(() => {});
    };
    const scan = () => {
      if (disposed) return;
      try {
        choreography.forEach(([selector, kind, fixedDelay]) => {
          root.querySelectorAll(selector).forEach((element) => {
            if (visited.has(element)) return;
            const siblingIndex = [...element.parentElement.children].indexOf(element);
            recipes.set(element, { kind, delay: fixedDelay ?? Math.min(siblingIndex, 5) * stagger });
            observer.observe(element);
          });
        });
        animations.forEach((animation, element) => { if (!element.isConnected) { animation.cancel(); animations.delete(element); } });
        schedule();
      } catch { failOpen(); }
    };
    const updateDepth = () => {
      frame = undefined;
      if (disposed || reduced.matches) return;
      try {
        const height = window.innerHeight;
        if (!compact.matches) root.querySelectorAll('[data-depth]').forEach((element) => {
          if (element.closest('.motion-paused')) return;
          const rect = element.parentElement.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > height) return;
          const progress = Math.max(-1, Math.min(1, (height / 2 - rect.top - rect.height / 2) / height));
          element.style.translate = `0 ${progress * Number(element.dataset.depth)}px`;
        });
        const timeline = root.querySelector('.timeline');
        if (timeline) {
          const rect = timeline.getBoundingClientRect();
          const progress = Math.max(0, Math.min(1, (height * 0.7 - rect.top) / rect.height));
          timeline.style.setProperty('--journey-progress', progress);
          timeline.querySelectorAll('.timeline-item').forEach((item) => {
            item.dataset.passed = String(item.getBoundingClientRect().top < height * 0.7);
          });
        }
      } catch { failOpen(); }
    };
    const schedule = () => { if (!disposed && frame === undefined) frame = requestAnimationFrame(updateDepth); };
    const preferenceChanged = () => { cancelAll(); resetDepth(); schedule(); };
    // Focus must never arrive on a delayed, masked, or moving control.
    const onFocus = (event) => {
      animations.forEach((animation, element) => {
        if (element.contains(event.target)) { animation.cancel(); animations.delete(element); }
      });
      let element = event.target;
      while (element && element !== root) {
        if (recipes.has(element)) { visited.add(element); observer?.unobserve(element); }
        element = element.parentElement;
      }
    };
    try {
      observer = new IntersectionObserver((entries) => {
        try { entries.forEach(({ target, isIntersecting }) => { if (isIntersecting) reveal(target); }); }
        catch { failOpen(); }
      }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
      mutations = new MutationObserver(scan);
      mutations.observe(root, { childList: true, subtree: true });
      if (window.ResizeObserver) { resize = new ResizeObserver(schedule); resize.observe(root); }
      root.classList.add('cinematic-ready');
      scan();
      document.fonts?.ready.then(() => { if (!disposed) schedule(); });
    } catch { failOpen(); }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    root.addEventListener('load', schedule, true);
    root.addEventListener('focusin', onFocus);
    reduced.addEventListener('change', preferenceChanged);
    compact.addEventListener('change', preferenceChanged);
    return () => {
      disposed = true;
      failOpen();
      if (frame !== undefined) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      root.removeEventListener('load', schedule, true);
      root.removeEventListener('focusin', onFocus);
      reduced.removeEventListener('change', preferenceChanged);
      compact.removeEventListener('change', preferenceChanged);
    };
  }, [rootRef, enabled]);
}
