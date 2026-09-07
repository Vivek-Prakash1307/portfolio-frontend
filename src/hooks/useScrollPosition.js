import { useEffect, useState } from 'react';

// Use section start positions instead of intersection percentages, so tall sections stay active.
export default function useScrollPosition(sectionIds) {
  const [position, setPosition] = useState({ active: 'home', progress: 0 });
  useEffect(() => {
    let frame;
    const update = () => {
      frame = undefined;
      let active = sectionIds[0];
      for (const id of sectionIds) {
        if ((document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= 140) active = id;
      }
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? Math.min(1, Math.max(0, window.scrollY / height)) : 0;
      if (progress >= 0.995) active = sectionIds[sectionIds.length - 1];
      setPosition((current) => current.active === active && Math.abs(current.progress - progress) < 0.002 ? current : { active, progress });
    };
    const schedule = () => { if (frame === undefined) frame = window.requestAnimationFrame(update); };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    };
  }, [sectionIds]);
  return position;
}
