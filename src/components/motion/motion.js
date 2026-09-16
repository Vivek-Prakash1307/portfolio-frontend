// Shared native animation recipes; content stays readable without JavaScript.
export const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
export const stagger = 95;

export function revealFrames(kind, mobile = false) {
  const distance = mobile ? 18 : 38;
  const entrance = { opacity: 0, translate: `0 ${distance}px` };
  const settled = { opacity: 1, translate: '0 0' };
  if (kind === 'heading') return [
    { ...entrance, filter: mobile ? 'none' : 'blur(4px)' },
    { ...settled, filter: mobile ? 'none' : 'blur(0px)' },
  ];
  if (kind === 'left' || kind === 'right') return [
    { opacity: 0, translate: `${(kind === 'left' ? -1 : 1) * distance}px 0` }, settled,
  ];
  if (kind === 'circle') return [
    { opacity: 0, clipPath: 'circle(12% at 65% 40%)', scale: 1.04 },
    { opacity: 1, clipPath: 'circle(150% at 65% 40%)', scale: 1 },
  ];
  if (kind === 'dot') return [
    { opacity: 0, translate: `0 ${distance / 2}px`, scale: 0.4 },
    { ...settled, scale: 1 },
  ];
  if (kind === 'fade') return [{ opacity: 0 }, { opacity: 1 }];
  if (kind === 'project') return [
    { ...entrance, scale: mobile ? 0.99 : 0.97, rotate: mobile ? '0deg' : '0.7deg' },
    { ...settled, scale: 1, rotate: '0deg' },
  ];
  if (kind === 'lift') return [{ ...entrance, scale: 0.96 }, { ...settled, scale: 1 }];
  return [entrance, settled];
}

// Animate cards as units: nested entrances compete and make text appear twice.
export const choreography = [
  ['.hero-content > *', 'enter'],
  ['.hero-visual', 'circle'],
  ['.agentic-showcase > p, .agentic-showcase > h2', 'heading'],
  ['.agentic-card', 'lift'],
  ['.hero-panel > div', 'enter'],
  ['.section-heading > .eyebrow', 'left'],
  ['.section-heading > h2, .flow-copy h2', 'heading'],
  ['.section-heading > p:not(.eyebrow)', 'enter'],
  ['.timeline-item > span', 'left'],
  ['.timeline-item h3, .timeline-organization', 'right'],
  ['.timeline-item p:not(.timeline-organization), .timeline-bullets > li, .timeline-item .tech-list', 'enter'],
  ['.case-study-card:nth-child(odd)', 'left'],
  ['.case-study-card:nth-child(even)', 'right'],
  ['.additional-card', 'lift'],
  ['.project-controls, .category-filters, .project-results', 'fade'],
  ['.explorer-card', 'project'],
  ['.flow-copy > p, .flow-copy > button', 'enter'],
  ['.about-copy > p', 'left'],
  ['.principle-card', 'right'],
  ['.skill-orbits > span', 'dot'],
  ['.skill-card', 'lift'],
  ['.coding-profiles, .contact-links > a, .contact-tools', 'enter'],
  ['.contact-form', 'right'],
  ['.site-footer > *', 'enter'],
];
