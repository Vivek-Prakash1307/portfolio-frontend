import { useEffect, useMemo, useState } from 'react';
import Dialog from '../../components/ui/Dialog';
import CopyButton from '../../components/ui/CopyButton';
import Icon from '../../components/ui/Icon';
import SectionHeading from '../../components/ui/SectionHeading';
import './projects.css';

function readURL() {
  const params = new URLSearchParams(window.location.search);
  return { query: params.get('q') || '', category: params.get('category') || '', technology: params.get('technology') || '', selected: params.get('project') || '' };
}

export default function ProjectExplorer({ projects }) {
  const [filters, setFilters] = useState(readURL);
  useEffect(() => {
    const onPop = () => setFilters(readURL());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const categories = useMemo(() => [...new Set(projects.map((p) => p.category))], [projects]);
  const technologies = useMemo(() => [...new Set(projects.flatMap((p) => p.tech))].sort(), [projects]);
  const filtered = useMemo(() => projects.filter((project) => {
    const haystack = `${project.title} ${project.description} ${project.category} ${project.tech.join(' ')}`.toLowerCase();
    return haystack.includes(filters.query.trim().toLowerCase()) && (!filters.category || project.category === filters.category)
      && (!filters.technology || project.tech.includes(filters.technology));
  }), [filters, projects]);
  const selected = projects.find((project) => project.id === filters.selected);
  const hasFilters = Boolean(filters.query || filters.category || filters.technology);

  function update(changes, push = false) {
    const next = { ...filters, ...changes };
    setFilters(next);
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries({ q: next.query, category: next.category, technology: next.technology, project: next.selected })) {
      if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
    }
    if (push) url.hash = 'work';
    window.history[push ? 'pushState' : 'replaceState']({}, '', url);
  }
  function clear() { update({ query: '', category: '', technology: '' }); }

  return <section id="work" className="section work-section" aria-labelledby="projects-heading">
    <SectionHeading eyebrow="Selected work" title={<span id="projects-heading">Explore the systems I build.</span>}>
      <p>Start with a problem, a technology, or a featured personal engineering project.</p>
    </SectionHeading>
    <div className="project-controls">
      <label className="search-field">Search projects
        <input type="search" placeholder="Try Go, concurrency, or uploads" value={filters.query} maxLength={200}
          onChange={(event) => update({ query: event.target.value })} />
      </label>
      <label>Technology
        <select value={filters.technology} onChange={(event) => update({ technology: event.target.value })}>
          <option value="">All technologies</option>
          {technologies.map((technology) => <option key={technology}>{technology}</option>)}
        </select>
      </label>
    </div>
    <div className="category-filters" role="group" aria-label="Project categories">
      <button type="button" aria-pressed={!filters.category} onClick={() => update({ category: '' })}>All projects</button>
      {categories.map((category) => <button key={category} type="button" aria-pressed={filters.category === category}
        onClick={() => update({ category })}>{category}</button>)}
    </div>
    <div className="project-results">
      <p role="status">Showing {filtered.length} of {projects.length} projects</p>
      {hasFilters && <button type="button" className="text-button" onClick={clear}>Clear filters</button>}
    </div>
    {filtered.length === 0 ? <div className="empty-state"><h3>No projects match those filters.</h3><p>Try another technology or a broader search.</p>
      <button type="button" className="secondary-button" onClick={clear}>Show all projects</button></div> :
      <div className="explorer-grid">{filtered.map((project) => <article className={`project-card explorer-card${project.featured ? ' is-featured' : ''}`} key={project.id}>
        <span className={`project-aperture${project.id === projects.find((item) => item.featured)?.id ? ' is-circular' : ''}`} aria-hidden="true" />
        <div className="project-meta"><span>{project.category}</span>{project.featured && <span className="featured-badge">Featured</span>}</div>
        <h3>{project.title}</h3><p>{project.description}</p>
        <div className="tech-list compact">{project.tech.slice(0, 5).map((tech) => <span key={tech}>{tech}</span>)}</div>
        <div className="project-card-actions">
          <button className="project-link" type="button" onClick={() => update({ selected: project.id }, true)} aria-label={`Explore ${project.title}`} data-cursor="expand">Explore project <Icon name="arrow" /></button>
          <a className="project-link" href={project.github} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} on GitHub`} data-cursor="expand">GitHub <Icon name="external" /></a>
        </div>
      </article>)}</div>}
    {filters.selected && !selected && <p className="form-status" role="status">That project could not be found. <button type="button" className="text-button" onClick={() => update({ selected: '' })}>Dismiss</button></p>}
    {selected && <Dialog titleId="project-detail-title" onClose={() => update({ selected: '' })}>
      <p className="eyebrow">{selected.category}{selected.featured ? ' / Featured work' : ''}</p>
      <h2 id="project-detail-title">{selected.title}</h2>
      <p className="project-detail-summary">{selected.description}</p>
      <h3>System flow</h3>
      <ol className="architecture-flow">{selected.architecture.map((step, index) => <li key={step}><span aria-hidden="true">0{index + 1}</span>{step}</li>)}</ol>
      <h3>Engineering focus</h3><ul className="project-highlights">{selected.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
      <h3>Technology stack</h3><div className="tech-list">{selected.tech.map((tech) => <span key={tech}>{tech}</span>)}</div>
      <div className="detail-actions"><a className="primary-button" href={selected.github} target="_blank" rel="noopener noreferrer" data-cursor="expand">Read the source <Icon name="external" /></a>
        <CopyButton value={window.location.href} label="Copy project link" /></div>
    </Dialog>}
  </section>;
}
