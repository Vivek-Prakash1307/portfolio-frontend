// A single native motion system. Nothing is hidden while waiting for an observer.
export const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
export const stagger = 80;

export function revealFrames(kind, mobile = false) {
  const distance = mobile ? 12 : 24;
  const entrance = { opacity: 0, translate: `0 ${distance}px` };
  const settled = { opacity: 1, translate: '0 0' };
  if (kind === 'heading') return [{ ...entrance, filter: 'blur(3px)' }, { ...settled, filter: 'blur(0px)' }];
  if (kind === 'image') return [{ scale: 1.06 }, { scale: 1 }];
  if (kind === 'circle') return [{ clipPath: 'circle(0% at 65% 40%)', scale: 1.06 }, { clipPath: 'circle(150% at 65% 40%)', scale: 1 }];
  if (kind === 'wipe') return [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }];
  if (kind === 'dot') return [{ opacity: 0, translate: `${mobile ? 12 : 36}px 12px`, scale: 0.5 }, { ...settled, scale: 1 }];
  if (kind === 'fade') return [{ opacity: 0 }, { opacity: 1 }];
  if (kind === 'project') return [
    { ...entrance, clipPath: mobile ? 'none' : 'inset(0 0 16% 0 round 16px)' },
    { ...settled, clipPath: mobile ? 'none' : 'inset(0 0 0% 0 round 16px)' },
  ];
  return [entrance, settled];
}

// Selectors stay inside the portfolio root; dynamic project results use the same recipes.
export const choreography = [
  ['.hero-content > *', 'enter'],
  ['.hero-visual', 'circle'],
  ['.agentic-showcase > p, .agentic-showcase > h2', 'enter'],
  ['.agentic-card img', 'image'],
  ['.agentic-card > div, .hero-panel > div', 'enter'],
  ['.section-heading > .eyebrow', 'enter'],
  ['.section-heading > h2, .flow-copy h2', 'heading'],
  ['.section-heading > p:not(.eyebrow)', 'enter'],
  ['.timeline-organization', 'enter', 0],
  ['.timeline-item h3', 'enter', 80],
  ['.timeline-item > span', 'enter', 160],
  ['.timeline-item p:not(.timeline-organization), .timeline-bullets, .timeline-item .tech-list', 'enter', 240],
  ['.case-study-card > *, .additional-card', 'enter'],
  ['.project-controls, .category-filters, .project-results', 'fade'],
  ['.explorer-card', 'project'],
  ['.explorer-card > h3', 'enter', 80],
  ['.explorer-card > p, .explorer-card > .tech-list', 'enter', 160],
  ['.explorer-card > .project-card-actions', 'fade', 240],
  ['.project-aperture', 'wipe', 0],
  ['.project-aperture.is-circular', 'circle', 0],
  ['.flow-copy > p, .flow-copy > button', 'enter'],
  ['.about-copy > p, .principle-card', 'enter'],
  ['.skill-orbits > span', 'dot'],
  ['.skill-card', 'enter'],
  ['.coding-profiles, .contact-links > a, .contact-tools, .contact-form', 'enter'],
  ['.site-footer > *', 'enter'],
];
