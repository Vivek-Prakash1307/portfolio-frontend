import { useEffect, useRef, useState } from 'react';
import Icon from '../ui/Icon';

export const sections = ['home', 'journey', 'case-studies', 'work', 'about', 'skills', 'contact'];
const labels = {
  home: 'Home',
  journey: 'Experience',
  'case-studies': 'Case studies',
  work: 'Projects',
  about: 'About',
  skills: 'Skills',
  contact: 'Contact',
};

export default function Header({ profile, active, progress }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef(null);
  useEffect(() => {
    const close = (event) => {
      if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); toggleRef.current?.focus(); }
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [menuOpen]);
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <div className="scroll-progress" aria-hidden="true" style={{ transform: `scaleX(${progress})` }} />
    <header className="site-header">
      <a className="brand" href="#home" onClick={() => setMenuOpen(false)}><span className="brand-mark">VP</span>
        <span><strong>{profile.name}</strong><small>Systems-minded builder</small></span></a>
      <nav id="primary-navigation" className={menuOpen ? 'nav-links is-open' : 'nav-links'} aria-label="Primary navigation">
        {sections.map((section) => <a key={section} href={`#${section}`} onClick={() => setMenuOpen(false)}
          aria-current={active === section ? 'location' : undefined} className={active === section ? 'nav-link active' : 'nav-link'}>
          {labels[section]}
        </a>)}
      </nav>
      <div className="header-actions">
        <a className="resume-link" href="/resume.pdf" download="Vivek_Prakash_Resume.pdf" data-cursor="expand">Resume <Icon name="download" /></a>
        <button ref={toggleRef} className="menu-toggle" type="button" onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="primary-navigation">
          <Icon name={menuOpen ? 'close' : 'menu'} />
        </button>
      </div>
    </header>
  </>;
}
