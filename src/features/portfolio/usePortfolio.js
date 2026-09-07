import { useEffect, useState } from 'react';
import snapshot from '../../data/portfolio.generated.json';
import { fetchPortfolio } from '../../services/api';

const text = (value) => typeof value === 'string';
const texts = (value) => Array.isArray(value) && value.every(text);
const list = (value, predicate) => Array.isArray(value) && value.every(predicate);
const https = (value) => text(value) && /^https:\/\//i.test(value);

// Treat remote content as a boundary: never replace usable bundled content with partial data.
export function isPortfolioData(data) {
  const p = data?.profile;
  return Boolean(p && ['name', 'role', 'location', 'email', 'headline', 'summary', 'about'].every((key) => text(p[key]))
    && texts(p.focus) && list(p.stats, (stat) => stat && text(stat.value) && text(stat.label))
    && p.links && ['github', 'linkedin', 'leetcode', 'geeksforgeeks'].every((key) => https(p.links[key]))
    && p.education && ['degree', 'institution', 'years', 'cgpa'].every((key) => text(p.education[key]))
    && Array.isArray(data.projects) && data.projects.length > 0
    && list(data.projects, (project) => project && ['id', 'title', 'description', 'category'].every((key) => text(project[key]))
      && typeof project.featured === 'boolean' && https(project.github)
      && texts(project.tech) && texts(project.highlights) && texts(project.architecture))
    && new Set(data.projects.map((project) => project.id)).size === data.projects.length
    && list(data.skillGroups, (group) => group && text(group.title) && texts(group.items))
    && list(data.techStack, (tech) => tech && ['name', 'tone', 'mark'].every((key) => text(tech[key])))
    && list(data.journey, (item) => item && ['year', 'title', 'text'].every((key) => text(item[key]))
      && (item.bullets === undefined || texts(item.bullets)))
    && list(data.caseStudies, (study) => study && ['id', 'title', 'eyebrow', 'problem', 'responsibility', 'result', 'validation'].every((key) => text(study[key]))
      && texts(study.implementation) && texts(study.decisions) && texts(study.technologies))
    && texts(data.additionalContributions));
}

export default function usePortfolio() {
  const [portfolio, setPortfolio] = useState(snapshot);
  useEffect(() => {
    const controller = new AbortController();
    fetchPortfolio(controller.signal)
      .then((data) => { if (!controller.signal.aborted && isPortfolioData(data)) setPortfolio(data); })
      .catch(() => { /* The bundled snapshot keeps every project and contact link usable. */ });
    return () => controller.abort();
  }, []);
  return portfolio;
}
