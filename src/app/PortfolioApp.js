import { useRef, useState } from 'react';
import '../styles/site.css';
import '../components/motion/motion.css';
import Intro, { shouldPlayIntro } from '../components/motion/Intro';
import useCinematicMotion from '../components/motion/useCinematicMotion';
import Header, { sections } from '../components/layout/Header';
import Icon from '../components/ui/Icon';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import usePortfolio from '../features/portfolio/usePortfolio';
import { Hero, FlowWall, About, Skills, Experience, CaseStudies } from '../features/portfolio/PortfolioSections';
import ProjectExplorer from '../features/projects/ProjectExplorer';
import ContactSection from '../features/contact/ContactSection';
import useScrollPosition from '../hooks/useScrollPosition';

export default function PortfolioApp() {
  const data = usePortfolio();
  const shellRef = useRef(null);
  const [introActive, setIntroActive] = useState(shouldPlayIntro);
  useCinematicMotion(shellRef, !introActive);
  const { active, progress } = useScrollPosition(sections);
  return <ErrorBoundary><div className="site-shell" ref={shellRef}>
    {introActive && <Intro profile={data.profile} onComplete={() => setIntroActive(false)} />}
    <Header profile={data.profile} active={active} progress={progress} />
    <main id="main-content" tabIndex={-1}>
      <Hero profile={data.profile} />
      <Experience journey={data.journey} />
      <CaseStudies studies={data.caseStudies || []} additionalContributions={data.additionalContributions || []} />
      <ProjectExplorer projects={data.projects} />
      <FlowWall projects={data.projects} techStack={data.techStack} />
      <About profile={data.profile} /><Skills groups={data.skillGroups} profile={data.profile} />
      <ContactSection profile={data.profile} />
    </main>
    <footer className="site-footer"><p>{data.profile.name}</p><span>Built with React and Go | {new Date().getFullYear()}</span></footer>
    {progress > 0.15 && <a className="back-to-top" href="#home" aria-label="Back to top"><Icon name="up" /></a>}
  </div></ErrorBoundary>;
}
