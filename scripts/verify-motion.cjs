/* Run after npm run build. Requires Playwright (or PLAYWRIGHT_MODULE pointing to it).
 * All browser traffic is restricted to this local build; contact delivery is mocked.
 */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const snapshot = require('../src/data/portfolio.generated.json');
const build = path.resolve(__dirname, '../build');
const artifacts = path.join(build, 'motion-checks');
fs.mkdirSync(artifacts, { recursive: true });
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.pdf': 'application/pdf', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(build, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (!file.startsWith(build + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
const errors = [];
let browser;
async function prepare(context) {
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/v1/portfolio') return route.fulfill({ json: snapshot });
    if (url.pathname === '/api/v1/contact') return route.fulfill({ json: { status: 'queued', id: 'local-motion-check', message: 'Message accepted and queued for delivery.' } });
    if (url.hostname !== '127.0.0.1') return route.abort();
    return route.continue();
  });
  context.on('page', (page) => {
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  });
}
const settled = (page) => page.waitForTimeout(1600);
async function checkPage(page) {
  assert.deepEqual(await page.locator('main > section').evaluateAll((sections) => sections.map((section) => section.id)),
    ['home', 'journey', 'case-studies', 'work', 'flow', 'about', 'skills', 'contact']);
  for (const project of snapshot.projects) {
    const card = page.locator('.explorer-card').filter({ has: page.getByRole('heading', { name: project.title, exact: true }) });
    assert.equal(await card.count(), 1);
    assert.equal(await card.locator('p').innerText(), project.description);
    assert.equal(await card.locator('a').getAttribute('href'), project.github);
  }
  for (const study of snapshot.caseStudies) {
    const card = page.locator('.case-study-card').filter({ has: page.getByRole('heading', { name: study.title, exact: true }) });
    for (const value of [study.problem, study.responsibility, study.result, study.validation, ...study.implementation, ...study.decisions]) {
      assert((await card.textContent()).includes(value), `Missing case-study content: ${value}`);
    }
  }
  for (const item of snapshot.journey) {
    const card = page.locator('.timeline-item').filter({ has: page.getByRole('heading', { name: item.title, exact: true }) });
    for (const value of [item.title, item.year, item.text, ...(item.bullets || [])]) assert((await card.textContent()).includes(value));
  }
  assert.equal(await page.locator('a[download]').count(), 3);
  assert(await page.locator('a[href^="mailto:"]').count() > 0);
  for (const href of Object.values(snapshot.profile.links)) assert(await page.locator(`a[href="${href}"]`).count() > 0);
  // Exercise every chapter at normal scroll speed, then fast and reverse scrolling.
  for (const id of ['home', 'journey', 'case-studies', 'work', 'flow', 'about', 'skills', 'contact']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await settled(page);
    const issue = await page.locator(`#${id}`).evaluate((section) => {
      const texts = [...section.querySelectorAll('h1,h2,h3,p,a,button')];
      return texts.some((element) => {
        if (element.closest('[aria-hidden="true"], details:not([open])')) return false;
        const css = getComputedStyle(element);
        return css.opacity === '0' || (css.filter !== 'none' && css.filter !== 'blur(0px)');
      });
    });
    assert(!issue, `Hidden or blurred content in ${id}`);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Horizontal overflow in ${id}`);
    if (['home', 'work', 'skills', 'contact'].includes(id)) await page.screenshot({ path: path.join(artifacts, `${page.viewportSize().width}-${id}.png`) });
  }
  await page.evaluate(() => { window.scrollTo({ top: 0, behavior: 'instant' }); window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }); });
  await settled(page);
  assert(await page.locator('footer').isVisible());
  assert.equal(await page.locator('.nav-link[aria-current]').getAttribute('href'), '#contact');
  await page.getByRole('link', { name: 'Back to top' }).click();
  await settled(page);
  assert(await page.evaluate(() => scrollY < 10));
  assert.equal(await page.locator('.cinematic-intro').count(), 0);
}
async function run() {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await prepare(desktop);
  const page = await desktop.newPage();
  await page.goto(base);
  await page.getByRole('button', { name: 'Begin', exact: true }).waitFor();
  assert(await page.locator('.cinematic-intro').evaluate((dialog) => dialog.matches(':modal')));
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  await page.screenshot({ path: path.join(artifacts, 'intro.png') });
  await page.keyboard.press('Shift+Tab');
  assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Skip intro ->');
  await page.keyboard.press('Tab');
  const started = Date.now();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(750);
  await page.screenshot({ path: path.join(artifacts, 'intro-playing.png') });
  await page.locator('.cinematic-intro').waitFor({ state: 'detached' });
  assert(Date.now() - started >= 2000, 'Intro should last approximately 2-3 seconds');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'main-content');
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  await checkPage(page);
  await page.reload();
  assert.equal(await page.locator('.cinematic-intro').count(), 0);
  // Filtering, project dialogs, copied URLs, and disclosures retain their behavior.
  await page.getByLabel('Search projects').fill('load balancer');
  assert.equal(await page.locator('.explorer-card').count(), 1);
  await page.getByRole('button', { name: 'Explore HTTP Load Balancer', exact: true }).click();
  await page.getByRole('dialog', { name: 'HTTP Load Balancer' }).waitFor();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('[role="dialog"]').count(), 0);
  assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), 'Explore HTTP Load Balancer');
  await page.getByRole('button', { name: 'Clear filters' }).click();
  assert.equal(await page.locator('.explorer-card').count(), 9);
  await page.locator('.case-study-card summary').first().click();
  assert(await page.locator('.case-study-card details').first().getAttribute('open') !== null);
  await page.getByRole('button', { name: 'Pause motion' }).click();
  assert.equal(await page.locator('.project-strip').evaluate((element) => getComputedStyle(element).animationPlayState), 'paused');
  await page.getByRole('button', { name: 'Send message' }).click();
  assert.equal(await page.evaluate(() => document.activeElement.id), 'contact-name');
  await page.getByLabel('Name', { exact: true }).fill('Local animation check');
  await page.getByLabel('Email', { exact: true }).fill('local-check@example.com');
  await page.getByLabel('Message', { exact: true }).fill('This is a local mocked contact form verification.');
  await page.getByRole('button', { name: 'Send message' }).click();
  await page.getByText('Message accepted and queued for delivery.').waitFor();
  const response = await page.request.get(`${base}/resume.pdf`);
  assert.equal(response.status(), 200);
  assert.equal((await response.body()).subarray(0, 4).toString(), '%PDF');
  // New tab, skip, interrupted animation, deep links, and reduced motion.
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await prepare(mobile);
  const phone = await mobile.newPage();
  await phone.goto(base);
  await phone.getByRole('button', { name: 'Skip intro' }).click();
  await checkPage(phone);
  await phone.getByRole('button', { name: 'Open navigation' }).click();
  await phone.getByRole('link', { name: 'Skills', exact: true }).click();
  await settled(phone);
  assert.equal(await phone.locator('.nav-link[aria-current]').getAttribute('href'), '#skills');
  assert.equal(await phone.getByRole('button', { name: 'Open navigation' }).getAttribute('aria-expanded'), 'false');
  await phone.evaluate(() => sessionStorage.clear());
  await phone.goto(`${base}/?project=chunked-file-uploader#work`);
  await phone.getByRole('dialog', { name: 'Chunked File Uploader' }).waitFor();
  assert.equal(await phone.locator('.cinematic-intro').count(), 0);
  await phone.keyboard.press('Escape');
  await phone.goto(base);
  await phone.getByRole('button', { name: 'Begin', exact: true }).click();
  await phone.keyboard.press('Escape');
  assert.equal(await phone.locator('.cinematic-intro').count(), 0);
  assert.equal(await phone.evaluate(() => document.body.style.overflow), '');
  await phone.evaluate(() => sessionStorage.clear());
  await phone.goto(base);
  await phone.emulateMedia({ reducedMotion: 'reduce' });
  await phone.locator('.cinematic-intro').waitFor({ state: 'detached' });
  await phone.reload();
  assert.equal(await phone.locator('.cinematic-intro').count(), 0);
  await phone.locator('#contact').scrollIntoViewIfNeeded();
  assert.equal(await phone.locator('[data-depth]').first().evaluate((element) => getComputedStyle(element).translate), 'none');
  // Simulate broken animation APIs: all content and actions must remain available.
  const fallback = await browser.newContext();
  await prepare(fallback);
  await fallback.addInitScript(() => { Element.prototype.animate = () => { throw new Error('Simulated animation failure'); }; });
  const failed = await fallback.newPage();
  await failed.goto(base);
  await failed.getByRole('button', { name: 'Begin', exact: true }).click();
  await failed.locator('.cinematic-intro').waitFor({ state: 'detached' });
  assert.equal(await failed.evaluate(() => document.body.style.overflow), '');
  assert.equal(await failed.locator('.explorer-card').count(), 9);
  await failed.locator('#contact').scrollIntoViewIfNeeded();
  assert(await failed.getByRole('button', { name: 'Send message' }).isVisible());
  assert.equal(await failed.locator('.cinematic-ready').count(), 0);
  assert.deepEqual(errors, [], 'Browser errors');
  console.log('PASS: desktop + mobile chapters, intro timing/focus/session/skip, navigation, content, filters, dialogs, disclosures, resume, mocked contact, reduced motion and animation failure.');
  console.log(`Screenshots: ${artifacts}`);
}
run().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => { await browser?.close(); server.close(); });
