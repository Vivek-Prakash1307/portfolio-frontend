import { useState } from 'react';
import SectionHeading from '../../components/ui/SectionHeading';
import Icon from '../../components/ui/Icon';

export function Hero({ profile }) {
  return <section id="home" className="hero-section">
    <img src="/assets/systems-hero.png" alt="" className="hero-image" width="1536" height="1024" fetchPriority="high" />
    <div className="hero-overlay" />
    <div className="hero-content">
      <p className="eyebrow">{profile.location} | Open to engineering opportunities</p>
      <h1>{profile.name}</h1><p className="hero-role">{profile.role}</p>{profile.headline && <p className="hero-headline">{profile.headline}</p>}<p className="hero-summary">{profile.summary}</p>
      <div className="hero-focus" aria-label="Engineering focus areas">{profile.focus.map((item) => <span key={item}>{item}</span>)}</div>
      <div className="hero-actions"><a className="primary-button" href="#case-studies">Review case studies <Icon name="arrow" /></a>
        <a className="secondary-button" href="/resume.pdf" download="Vivek_Prakash_Resume.pdf"><Icon name="download" />Download resume</a>
        <a className="hero-email" href={`mailto:${profile.email}`}>Get in touch <Icon name="external" /></a></div>
    </div>
    <div className="hero-panel">{profile.stats.map((stat) => <div key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div>
  </section>;
}
export function FlowWall({ projects, techStack }) {
  const [paused, setPaused] = useState(false);
  return <section id="flow" className={`flow-section${paused ? ' motion-paused' : ''}`} aria-label="Engineering stack gallery">
    <div className="flow-copy"><p className="eyebrow">The building blocks</p><h2>One stack. Many kinds of systems.</h2>
      <p>From concurrent data pipelines to full-stack interfaces, these are the tools behind the work.</p>
      <button type="button" className="secondary-button motion-control" aria-pressed={paused} onClick={() => setPaused((value) => !value)}>{paused ? 'Resume motion' : 'Pause motion'}</button></div>
    <div className="motion-stage" aria-hidden="true">
      <div className="project-strip strip-left">{[...projects, ...projects].map((project, index) => <article className="project-shot" key={`${project.id}-${index}`}>
        <div className="shot-toolbar"><span /><span /><span /></div><div className="shot-visual"><div className="shot-chart" /><div className="shot-lines"><span /><span /><span /></div></div><p>{project.title}</p>
      </article>)}</div>
      <div className="tech-strip strip-right">{[...techStack, ...techStack].map((tech, index) => <div className={`tech-tile tone-${tech.tone}`} key={`${tech.name}-${index}`}><strong>{tech.mark}</strong><span>{tech.name}</span></div>)}</div>
    </div>
  </section>;
}
export function About({ profile }) {
  return <section id="about" className="section about-section"><SectionHeading eyebrow="About" title="Backend depth with full-stack delivery." />
    <div className="about-grid"><article className="about-copy">
      {profile.about.split(' ').length > 1 ? profile.about.split('. ').map((sentence) => {
        const text = sentence.endsWith('.') ? sentence : `${sentence}.`;
        return <p key={text}>{text}</p>;
      }) : <p>{profile.about}</p>}
    </article><div className="principle-grid">{[
      ['Performance', 'Concurrency, caching, retries, and efficient backend workflows.'],
      ['Reliability', 'Health checks, recovery paths, validation, and practical fault tolerance.'],
      ['Clarity', 'Readable APIs and engineering decisions that are easy to explain.'],
      ['Ownership', 'Taking an idea through implementation, deployment, and documentation.'],
    ].map(([title, text]) => <article className="principle-card" key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></div>
  </section>;
}
export function Skills({ groups, profile }) {
  return <section id="skills" className="section skills-section"><SectionHeading eyebrow="Skills" title="A practical stack for backend-heavy products." />
    <div className="skills-grid">{groups.map((group) => <article className="skill-card" key={group.title}><h3>{group.title}</h3><div>{group.items.map((skill) => <span key={skill}>{skill}</span>)}</div></article>)}</div>
    <div className="coding-profiles"><p>More of my problem-solving practice</p>
      <a className="secondary-button" href={profile.links.leetcode} target="_blank" rel="noopener noreferrer">LeetCode <Icon name="external" /></a>
      <a className="secondary-button" href={profile.links.geeksforgeeks} target="_blank" rel="noopener noreferrer">GeeksforGeeks <Icon name="external" /></a></div>
  </section>;
}
export function Experience({ journey }) {
  return <section id="journey" className="section journey-section"><SectionHeading eyebrow="Professional experience" title="Backend work in real product environments.">
    <p>LIMDX and Evtaar are shown separately so each role keeps its correct context, scope, and contribution.</p>
  </SectionHeading>
    <div className="timeline">{journey.map((item) => <article className="timeline-item" key={item.title}><span>{item.year}</span><div><h3>{item.title}</h3>
      {item.organization && <p className="timeline-organization">{item.organization}</p>}<p>{item.text}</p>
      {item.bullets && <ul className="timeline-bullets">{item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
      {item.technologies && <div className="tech-list compact">{item.technologies.map((tech) => <span key={tech}>{tech}</span>)}</div>}</div></article>)}</div>
  </section>;
}
export function CaseStudies({ studies, additionalContributions }) {
  return <section id="case-studies" className="section case-study-section"><SectionHeading eyebrow="Featured backend engineering work" title="Evtaar case studies for engineering review.">
    <p>These completed product features included frontend and backend flows; the work described here focuses on my backend services, APIs, reliability fixes, storage, scheduling, and permissions contributions.</p>
  </SectionHeading>
    <div className="case-study-grid">{studies.map((study) => <article className="case-study-card" key={study.id}>
      <p className="card-eyebrow">{study.eyebrow}</p><h3>{study.title}</h3>
      <dl className="case-study-summary"><div><dt>Problem</dt><dd>{study.problem}</dd></div><div><dt>Responsibility</dt><dd>{study.responsibility}</dd></div><div><dt>Result</dt><dd>{study.result}</dd></div></dl>
      <details><summary>Backend implementation</summary><ul>{study.implementation.map((item) => <li key={item}>{item}</li>)}</ul></details>
      <details><summary>Engineering decisions</summary><ul>{study.decisions.map((item) => <li key={item}>{item}</li>)}</ul></details>
      <p className="validation-note"><strong>Validation:</strong> {study.validation}</p>
      <div className="tech-list compact">{study.technologies.map((tech) => <span key={tech}>{tech}</span>)}</div>
    </article>)}</div>
    <article className="additional-card"><h3>Additional backend contributions</h3>
      <ul>{additionalContributions.map((item) => <li key={item}>{item}</li>)}</ul>
    </article>
  </section>;
}
