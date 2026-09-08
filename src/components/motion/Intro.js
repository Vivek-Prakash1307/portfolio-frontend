import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { easing } from './motion';

export const INTRO_KEY = 'vp-cinematic-intro-seen';
export function shouldPlayIntro() {
  try {
    return Boolean(window.HTMLDialogElement?.prototype.showModal && window.matchMedia
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      && !window.location.hash && !window.location.search && window.scrollY < 10
      && !window.sessionStorage.getItem(INTRO_KEY));
  } catch { return false; }
}

// Evenly spaced points, using the same VP identity as the existing navigation.
const letters = ['1000001/1000001/1000001/0100010/0100010/0010100/0001000', '1111110/1000001/1000001/1111110/1000000/1000000/1000000'];
function DottedIdentity() {
  return <svg className="intro-dots" viewBox="0 0 216 96" aria-hidden="true">
    {letters.flatMap((letter, glyph) => letter.split('/').flatMap((row, y) => [...row].map((dot, x) => dot === '1'
      ? <circle key={`${glyph}-${x}-${y}`} cx={12 + (glyph * 9 + x) * 12} cy={12 + y * 12} r="1.7" style={{ '--dot-delay': `${(x + y + glyph * 4) * 32}ms` }} /> : null)))}
  </svg>;
}

export default function Intro({ profile, onComplete }) {
  const dialogRef = useRef(null);
  const completeRef = useRef(onComplete);
  const [playing, setPlaying] = useState(false);
  completeRef.current = onComplete;

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const overflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const exit = () => completeRef.current();
    try {
      dialog.showModal();
      document.body.style.overflow = 'hidden';
      // Mark on presentation, so refreshing an unfinished intro still opens the work.
      try { window.sessionStorage.setItem(INTRO_KEY, '1'); } catch { /* Storage may be disabled. */ }
      dialog.querySelector('button')?.focus();
    } catch { exit(); }
    preference.addEventListener('change', exit);
    window.addEventListener('hashchange', exit);
    window.addEventListener('popstate', exit);
    return () => {
      preference.removeEventListener('change', exit);
      window.removeEventListener('hashchange', exit);
      window.removeEventListener('popstate', exit);
      document.body.style.overflow = overflow;
      if (dialog.open) dialog.close();
      const destination = document.getElementById(window.location.hash.slice(1));
      if (!destination) document.getElementById('main-content')?.focus({ preventScroll: true });
      else if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    if (!playing) return undefined;
    let animation;
    // The timer is also a fail-open exit if animation completion is interrupted.
    const timeout = window.setTimeout(() => completeRef.current(), 2550);
    try {
      animation = dialogRef.current.animate([
        { opacity: 1, clipPath: 'inset(0 0 0 0)', offset: 0 },
        { opacity: 1, clipPath: 'inset(0 0 0 0)', offset: 0.65, easing },
        { opacity: 0, clipPath: 'inset(0 0 100% 0)', offset: 1 },
      ], { duration: 2450, easing: 'linear', fill: 'forwards' });
      animation.finished.then(() => completeRef.current()).catch(() => {});
    } catch { completeRef.current(); }
    return () => { clearTimeout(timeout); animation?.cancel(); };
  }, [playing]);

  const trapIntroFocus = (event) => {
    if (event.key !== 'Tab') return;
    const controls = [...event.currentTarget.querySelectorAll('button:not([disabled])')];
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return <dialog ref={dialogRef} className={`cinematic-intro${playing ? ' is-playing' : ''}`} aria-labelledby="intro-identity"
    onCancel={(event) => { event.preventDefault(); onComplete(); }} onKeyDown={trapIntroFocus}>
    <div className="intro-composition">
      <p className="eyebrow" id="intro-identity">{profile.name}</p>
      <DottedIdentity />
      <p className="intro-role">{profile.role}</p>
      <button className="intro-begin" type="button" onClick={() => setPlaying(true)} aria-disabled={playing} data-cursor="expand">
        {playing ? 'Entering portfolio' : 'Begin'}<span aria-hidden="true">-&gt;</span>
      </button>
    </div>
    <button className="intro-skip" type="button" onClick={onComplete}>Skip intro <span aria-hidden="true">-&gt;</span></button>
  </dialog>;
}
