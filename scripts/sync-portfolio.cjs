#!/usr/bin/env node
// The API's embedded JSON is the source of truth. Commit the generated snapshot
// so the frontend remains useful while the API is unavailable.
const fs = require('node:fs');
const path = require('node:path');

const sourcePath = process.env.PORTFOLIO_SOURCE ? path.resolve(process.env.PORTFOLIO_SOURCE) : path.resolve(__dirname, '../../my-portfolio-backend/content/portfolio.json');
const sourceExists = fs.existsSync(sourcePath);
const checkOnly = process.argv.includes('--check');
const targetPath = path.resolve(__dirname, '../src/data/portfolio.generated.json');

try {
  if (!sourceExists && !checkOnly) throw new Error('Clone the backend beside the frontend, or set PORTFOLIO_SOURCE to its content/portfolio.json path.');
  const data = JSON.parse(fs.readFileSync(sourceExists ? sourcePath : targetPath, 'utf8'));
  if (!data.profile?.name || !data.profile?.email || !Array.isArray(data.projects) ||
      !Array.isArray(data.skillGroups) || !Array.isArray(data.techStack) || !Array.isArray(data.journey) ||
      !Array.isArray(data.caseStudies) || !Array.isArray(data.additionalContributions)) {
    throw new Error('Portfolio content is missing required profile or collection fields.');
  }
  const ids = new Set();
  for (const project of data.projects) {
    if (!project.id || ids.has(project.id) || !project.title || !project.description ||
        !Array.isArray(project.tech) || !Array.isArray(project.architecture) ||
        !Array.isArray(project.highlights) || !project.category || typeof project.featured !== 'boolean') {
      throw new Error(`Invalid or duplicate project: ${project.id || '(missing id)'}`);
    }
    const github = new URL(project.github);
    if (github.protocol !== 'https:' || github.hostname !== 'github.com') {
      throw new Error(`Project ${project.id} needs a valid HTTPS GitHub repository URL.`);
    }
    ids.add(project.id);
  }
  const caseIds = new Set();
  for (const study of data.caseStudies) {
    if (!study.id || caseIds.has(study.id) || !study.title || !study.problem || !study.responsibility ||
        !Array.isArray(study.implementation) || !Array.isArray(study.decisions) || !study.result ||
        !study.validation || !Array.isArray(study.technologies)) {
      throw new Error(`Invalid or duplicate case study: ${study.id || '(missing id)'}`);
    }
    caseIds.add(study.id);
  }

  const expected = `${JSON.stringify(data, null, 2)}\n`;
  if (process.argv.includes('--check')) {
    const actual = fs.readFileSync(targetPath, 'utf8').replace(/\r\n/g, '\n');
    if (actual !== expected) {
      throw new Error('Portfolio snapshot is out of date. Run npm run content:sync and commit both files.');
    }
    console.log(sourceExists ? `Portfolio snapshot is current (${data.projects.length} projects).` : `Standalone portfolio snapshot validated (${data.projects.length} projects).`);
  } else {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, expected);
    console.log(`Updated frontend portfolio snapshot (${data.projects.length} projects).`);
  }
} catch (error) {
  console.error(`Content check failed: ${error.message}`);
  process.exitCode = 1;
}
