import { useLayoutEffect } from 'react';
import { choreography, easing, revealFrames, stagger } from './motion';

export default function useCinematicMotion(rootRef, enabled) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root || !window.matchMedia || !window.IntersectionObserver || !Element.prototype.animate) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const compact = window.matchMedia('(max-width: 820px)');
    const visited = new WeakSet();
    const recipes = new WeakMap();
    const animations = new Map();
    const pending = new Set();
    const inView = new Set();
    let disposed = false;
    let failed = false;
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
      failed = true;
      observer?.disconnect(); mutations?.disconnect(); resize?.disconnect(); cancelAll(); resetDepth();
      pending.forEach((element) => element.removeAttribute('data-reveal-pending'));
      pending.clear(); inView.clear();
      root.classList.remove('cinematic-ready');
    };
    const reveal = (element, delay = 0, immediate = false) => {
      if (visited.has(element)) return;
      visited.add(element);
      pending.delete(element); inView.delete(element);
      element.removeAttribute('data-reveal-pending');
      observer?.unobserve(element);
      if (immediate || reduced.matches || element.contains(document.activeElement)) return;
      const { kind } = recipes.get(element);
      const major = ['heading', 'circle', 'project', 'lift'].includes(kind);
      const animation = element.animate(revealFrames(compact.matches && kind === 'circle' ? 'fade' : kind, compact.matches), {
        duration: compact.matches ? 560 : major ? 900 : 720, delay, easing, fill: 'backwards',
      });
      animations.set(element, animation);
      // No forward fill: completed effects release their styles and hover transforms.
      animation.finished.then(() => { if (animations.get(element) === animation) animations.delete(element); }).catch(() => {});
    };
    const scan = () => {
      if (disposed || failed) return;
      try {
        choreography.forEach(([selector, kind]) => {
          root.querySelectorAll(selector).forEach((element) => {
            if (visited.has(element) || pending.has(element)) return;
            recipes.set(element, { kind });
            if (reduced.matches || element.contains(document.activeElement)) {
              reveal(element, 0, true);
              return;
            }
            pending.add(element);
            element.setAttribute('data-reveal-pending', '');
            observer.observe(element);
          });
        });
        animations.forEach((animation, element) => { if (!element.isConnected) { animation.cancel(); animations.delete(element); } });
        pending.forEach((element) => {
          if (!root.contains(element)) {
            element.removeAttribute('data-reveal-pending');
            pending.delete(element); inView.delete(element); observer.unobserve(element);
          }
        });
        schedule();
      } catch { failOpen(); }
    };
    const updateDepth = () => {
      frame = undefined;
      if (disposed || failed || reduced.matches) return;
      try {
        const height = window.innerHeight;
        const atBottom = window.scrollY + height >= document.documentElement.scrollHeight - 4;
        const groups = new Map();
        // Only stagger siblings entering together, never accumulate delays down the page.
        [...inView].map((element) => ({ element, rect: element.getBoundingClientRect() }))
          .sort((a, b) => a.rect.top - b.rect.top || a.rect.left - b.rect.left)
          .forEach(({ element, rect }) => {
            if (rect.top > height * 0.86 && !atBottom) return;
            const index = groups.get(element.parentElement) || 0;
            groups.set(element.parentElement, index + 1);
            reveal(element, Math.min(index, 3) * (compact.matches ? 60 : stagger), rect.bottom <= 0);
          });
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
    const preferenceChanged = () => {
      cancelAll(); resetDepth();
      if (reduced.matches) [...pending].forEach((element) => reveal(element, 0, true));
      schedule();
    };
    // Focus must never arrive on a delayed, masked, or moving control.
    const onFocus = (event) => {
      animations.forEach((animation, element) => {
        if (element.contains(event.target)) { animation.cancel(); animations.delete(element); }
      });
      let element = event.target;
      while (element && element !== root) {
        if (recipes.has(element)) reveal(element, 0, true);
        element = element.parentElement;
      }
    };
    try {
      observer = new IntersectionObserver((entries) => {
        try {
          entries.forEach(({ target, isIntersecting, boundingClientRect }) => {
            if (!pending.has(target)) return;
            if (isIntersecting) inView.add(target);
            else {
              inView.delete(target);
              // Fast scrolling and anchor jumps may skip the intersection entirely.
              if (boundingClientRect.bottom <= 0) reveal(target, 0, true);
            }
          });
          schedule();
        }
        catch { failOpen(); }
      }, { threshold: 0 });
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
