import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

const portfolio = {
  name: 'Vivek Prakash',
  role: 'Backend-Focused Full Stack Developer',
  location: 'Bengaluru, India',
  email: 'alivevivek8@gmail.com',
  phone: '+91 7309058513',
  summary:
    'I build production-minded backend systems, APIs, automation tools, and full-stack products with Go, React, databases, Docker, and cloud deployments.',
  focus: ['Go services', 'Distributed systems', 'API platforms', 'Cloud deployments'],
  stats: [
    { value: '15+', label: 'production-style projects' },
    { value: '500+', label: 'companies processed in data pipelines' },
    { value: 'Go', label: 'primary backend language' },
    { value: '2026', label: 'B.Tech CSE graduate' },
  ],
  links: {
    github: 'https://github.com/Vivek-Prakash1307',
    linkedin: 'https://linkedin.com/in/vivek-prakash-00230a300',
    leetcode: 'https://leetcode.com/u/alivevivek8',
    geeksforgeeks: 'https://geeksforgeeks.org/user/alivevng22/',
  },
  education: {
    degree: 'B.Tech in Computer Science',
    institution: 'Dayananda Sagar University, Bengaluru',
    years: '2022-2026',
    cgpa: '8.59/10',
  },
};

const featuredProjects = [
  {
    title: 'Automated Financial Data Extraction and Analysis System',
    eyebrow: 'Concurrent data platform',
    description:
      'A Go platform that processes stock market data for 500+ companies with concurrent scraping, checkpoint recovery, retry handling, structured parsing, and CSV/data workflows.',
    impact: ['High-volume extraction', 'Fault-tolerant processing', 'Checkpoint recovery'],
    tech: ['Go', 'Goroutines', 'Web Scraping', 'HTML Parsing', 'CSV', 'Structured Logging'],
    github:
      'https://github.com/Vivek-Prakash1307/Automated-Financial-Data-Extraction-and-Analysis-System-',
  },
  {
    title: 'Repository-Centric Kubernetes Security Analysis Framework',
    eyebrow: 'DevSecOps system',
    description:
      'A security analysis framework for repository-centric Kubernetes and Helm scanning with RBAC validation, network policy checks, WebSocket operations, and posture scoring.',
    impact: ['Repository scanning', 'Security posture scoring', 'Helm chart analysis'],
    tech: ['Go', 'Kubernetes', 'Helm', 'WebSockets', 'Docker', 'GitHub APIs'],
    github: 'https://github.com/Aegios-k8s/major-project',
  },
  {
    title: 'Email Intelligence Platform',
    eyebrow: 'Production-ready verification',
    description:
      'A full-stack email verification system with concurrent domain checks, DNS MX lookup, SMTP validation, REST APIs, PostgreSQL, Docker, and cloud deployment.',
    impact: ['Concurrent checks', 'DNS validation', 'Cloud deployment'],
    tech: ['Go', 'Gin', 'React', 'PostgreSQL', 'Docker', 'Render', 'Vercel'],
    github: 'https://github.com/Vivek-Prakash1307/email-intelligence-platform',
  },
];

const moreProjects = [
  {
    title: 'HTTP Load Balancer',
    description:
      'Custom Go reverse proxy with round-robin distribution, health checks, and fault-tolerant request routing.',
    tech: ['Go', 'net/http', 'Reverse Proxy', 'Concurrency'],
    github: 'https://github.com/Vivek-Prakash1307/Load_Balancer',
  },
  {
    title: 'Chunked File Uploader',
    description:
      'React and TypeScript uploader with resumable chunks, retry flows, IndexedDB persistence, state-machine logic, and tests.',
    tech: ['React', 'TypeScript', 'IndexedDB', 'Vitest', 'Playwright'],
    github: 'https://github.com/Vivek-Prakash1307/chunked-file-uploader',
  },
  {
    title: 'PPT-to-PDF Converter',
    description:
      'Go web app for document conversion using LibreOffice, concurrent processing, large uploads, progress tracking, and Docker deployment.',
    tech: ['Go', 'Gin', 'LibreOffice', 'Docker', 'Railway'],
    github: 'https://github.com/Vivek-Prakash1307/PPT-TO-PDF-CONVERTER',
  },
  {
    title: 'WeatherStack',
    description:
      'Go weather microservice with caching, health checks, API integration, Docker support, and reliable REST endpoints.',
    tech: ['Go', 'Gin', 'Caching', 'Docker', 'REST APIs'],
    github: 'https://github.com/Vivek-Prakash1307/weatherstack-go',
  },
  {
    title: 'Web Server API',
    description:
      'REST API with Gin and GORM for authentication and product management backed by MySQL CRUD workflows.',
    tech: ['Go', 'Gin', 'GORM', 'MySQL', 'Auth'],
    github: 'https://github.com/Vivek-Prakash1307/Web-Server-API',
  },
  {
    title: 'TaskFlow',
    description:
      'Full-stack task management app with JWT authentication, kanban-style workflows, responsive UI, and real-time CRUD operations.',
    tech: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT'],
    github: 'https://github.com/Vivek-Prakash1307/PrimeTrade',
  },
];

const skillGroups = [
  {
    title: 'Backend Engineering',
    items: ['Go', 'Gin', 'Fiber', 'REST APIs', 'JWT Auth', 'Microservices', 'Goroutines'],
  },
  {
    title: 'Systems and Infrastructure',
    items: ['Docker', 'Linux', 'HTTP', 'DNS', 'Reverse Proxies', 'Kubernetes Basics', 'CI/CD Basics'],
  },
  {
    title: 'Data and Storage',
    items: ['PostgreSQL', 'MySQL', 'MongoDB', 'CSV Pipelines', 'Caching', 'Structured Logging'],
  },
  {
    title: 'Frontend Delivery',
    items: ['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Accessibility', 'Playwright'],
  },
];

const journey = [
  {
    year: 'Now',
    title: 'Building production-grade systems',
    text: 'Focused on backend-heavy full-stack projects: data processing, security analysis, verification platforms, upload systems, and deployment workflows.',
  },
  {
    year: '2022-2026',
    title: portfolio.education.degree,
    text: `${portfolio.education.institution} - CGPA ${portfolio.education.cgpa}.`,
  },
  {
    year: 'Next',
    title: 'Seeking backend or full-stack engineering roles',
    text: 'Looking for teams where I can contribute to scalable products, learn from strong engineers, and own meaningful systems work.',
  },
];

function Icon({ name }) {
  const paths = {
    arrow: 'M5 12h14M13 5l7 7-7 7',
    mail: 'M4 6h16v12H4z M4 7l8 6 8-6',
    github:
      'M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.22-3.37-1.22-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05A9.25 9.25 0 0 1 12 6.96c.85 0 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.64 1.03 2.76 0 3.94-2.35 4.8-4.58 5.06.36.32.69.94.69 1.9 0 1.38-.01 2.49-.01 2.82 0 .27.18.59.69.49A10.07 10.07 0 0 0 22 12.26C22 6.58 17.52 2 12 2z',
    linkedin:
      'M6.94 8.75H3.82V19h3.12V8.75zM5.38 4a1.81 1.81 0 1 0 0 3.62A1.81 1.81 0 0 0 5.38 4zM20.18 13.19c0-3.08-1.65-4.51-3.85-4.51a3.32 3.32 0 0 0-3 1.65h-.04V8.75h-2.99V19h3.12v-5.07c0-1.34.25-2.63 1.91-2.63 1.63 0 1.65 1.53 1.65 2.72V19h3.12v-5.81h.08z',
    external: 'M7 17L17 7M8 7h9v9',
    menu: 'M4 7h16M4 12h16M4 17h16',
    close: 'M6 6l12 12M18 6L6 18',
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="icon">
      <path d={paths[name]} />
    </svg>
  );
}

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const sections = useMemo(
    () => ['home', 'about', 'work', 'skills', 'journey', 'contact'],
    []
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.35 }
    );

    const animatedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
      },
      { threshold: 0.12 }
    );

    sections.forEach((section) => {
      const node = document.getElementById(section);
      if (node) observer.observe(node);
    });

    document.querySelectorAll('.reveal').forEach((node) => animatedObserver.observe(node));

    return () => {
      observer.disconnect();
      animatedObserver.disconnect();
    };
  }, [sections]);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

    try {
      const response = await fetch(`${apiUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Unable to send message.');

      setFormData({ name: '', email: '', message: '' });
      setSubmitStatus(data.message || 'Message accepted. It is being delivered now.');
    } catch (error) {
      setSubmitStatus(`Could not send through the form. Email me directly at ${portfolio.email}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <button type="button" className="brand" onClick={() => scrollToSection('home')}>
          <span className="brand-mark">VP</span>
          <span>
            <strong>{portfolio.name}</strong>
            <small>Systems-minded builder</small>
          </span>
        </button>

        <nav className={menuOpen ? 'nav-links is-open' : 'nav-links'} aria-label="Primary navigation">
          {sections.map((section) => (
            <button
              key={section}
              type="button"
              onClick={() => scrollToSection(section)}
              className={activeSection === section ? 'nav-link active' : 'nav-link'}
            >
              {section === 'work' ? 'projects' : section}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <a className="resume-link" href="/resume.pdf" download="Vivek_Prakash_Resume.pdf">
            Resume
          </a>
          <button
            className="menu-toggle"
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>
        </div>
      </header>

      <main>
        <section id="home" className="hero-section">
          <img src="/assets/systems-hero.png" alt="" className="hero-image" />
          <div className="hero-overlay" />
          <div className="hero-content reveal is-visible">
            <p className="eyebrow">{portfolio.location}</p>
            <h1>{portfolio.name}</h1>
            <p className="hero-role">{portfolio.role}</p>
            <p className="hero-summary">{portfolio.summary}</p>

            <div className="hero-focus" aria-label="Engineering focus areas">
              {portfolio.focus.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>

            <div className="hero-actions">
              <button type="button" className="primary-button" onClick={() => scrollToSection('work')}>
                View strongest work
                <Icon name="arrow" />
              </button>
              <a className="secondary-button" href={`mailto:${portfolio.email}`}>
                <Icon name="mail" />
                Email me
              </a>
            </div>
          </div>

          <div className="hero-panel reveal is-visible">
            {portfolio.stats.map((stat) => (
              <div key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="section about-section">
          <div className="section-heading reveal">
            <p className="eyebrow">About</p>
            <h2>Backend depth with full-stack delivery.</h2>
          </div>

          <div className="about-grid">
            <article className="about-copy reveal">
              <p>
                I enjoy building real systems instead of thin demos: backend services, APIs, data
                pipelines, document tools, upload workflows, deployment setups, and frontend surfaces
                that make those systems usable.
              </p>
              <p>
                My strongest area is Go. I have worked with goroutines, HTTP servers, DNS lookups,
                reverse proxies, authentication, caching, file processing, databases, Docker, Linux,
                Render, Railway, and Vercel.
              </p>
              <p>
                I care about clean architecture, explainable code, debugging under pressure, and
                systems that continue to make sense after the first version ships.
              </p>
            </article>

            <div className="principle-grid reveal">
              {[
                ['Performance', 'Concurrency, caching, retries, and efficient backend workflows.'],
                ['Reliability', 'Health checks, recovery paths, validation, and practical fault tolerance.'],
                ['Clarity', 'Readable APIs, structured code, and decisions that are easy to explain.'],
                ['Ownership', 'Taking projects from idea to deployed, documented, usable software.'],
              ].map(([title, text]) => (
                <article className="principle-card" key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="work" className="section work-section">
          <div className="section-heading reveal">
            <p className="eyebrow">Selected Work</p>
            <h2>Projects that show systems thinking.</h2>
          </div>

          <div className="featured-grid">
            {featuredProjects.map((project, index) => (
              <article className="featured-card reveal" key={project.title}>
                <div className="featured-number">0{index + 1}</div>
                <p className="card-eyebrow">{project.eyebrow}</p>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="impact-list">
                  {project.impact.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                <div className="tech-list">
                  {project.tech.map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>
                <a href={project.github} target="_blank" rel="noopener noreferrer" className="project-link">
                  GitHub
                  <Icon name="external" />
                </a>
              </article>
            ))}
          </div>

          <div className="project-grid">
            {moreProjects.map((project) => (
              <article className="project-card reveal" key={project.title}>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="tech-list compact">
                  {project.tech.map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>
                <a href={project.github} target="_blank" rel="noopener noreferrer" className="project-link">
                  View repo
                  <Icon name="external" />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section id="skills" className="section skills-section">
          <div className="section-heading reveal">
            <p className="eyebrow">Skills</p>
            <h2>A practical stack for backend-heavy products.</h2>
          </div>

          <div className="skills-grid">
            {skillGroups.map((group) => (
              <article className="skill-card reveal" key={group.title}>
                <h3>{group.title}</h3>
                <div>
                  {group.items.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="journey" className="section journey-section">
          <div className="section-heading reveal">
            <p className="eyebrow">Journey</p>
            <h2>Where I have been focusing my engineering energy.</h2>
          </div>

          <div className="timeline">
            {journey.map((item) => (
              <article className="timeline-item reveal" key={item.title}>
                <span>{item.year}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="section contact-section">
          <div className="contact-layout">
            <div className="section-heading reveal">
              <p className="eyebrow">Contact</p>
              <h2>Let us build something useful.</h2>
              <p>
                I am open to backend and full-stack engineering opportunities, internships, and
                project collaborations.
              </p>

              <div className="contact-links">
                <a href={`mailto:${portfolio.email}`}>
                  <Icon name="mail" />
                  {portfolio.email}
                </a>
                <a href={portfolio.links.github} target="_blank" rel="noopener noreferrer">
                  <Icon name="github" />
                  GitHub
                </a>
                <a href={portfolio.links.linkedin} target="_blank" rel="noopener noreferrer">
                  <Icon name="linkedin" />
                  LinkedIn
                </a>
              </div>
            </div>

            <form className="contact-form reveal" onSubmit={handleSubmit}>
              <label>
                Name
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  required
                />
              </label>
              <label>
                Message
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell me what you want to build..."
                  rows="5"
                  required
                />
              </label>
              <button type="submit" className="primary-button" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send message'}
                <Icon name="arrow" />
              </button>
              {submitStatus && <p className="form-status">{submitStatus}</p>}
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>{portfolio.name}</p>
        <span>Built with React, Tailwind CSS, and a backend engineer's bias for clarity.</span>
      </footer>
    </div>
  );
}

export default App;
