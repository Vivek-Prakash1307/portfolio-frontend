# Cinematic animation system

This portfolio uses a small native browser motion layer instead of an animation dependency.

## Files

- `src/components/motion/Intro.js` controls the first-visit preloader.
- `src/components/motion/useCinematicMotion.js` observes sections, runs reveal animations, updates depth motion, and fails open.
- `src/components/motion/motion.js` maps existing selectors to animation recipes.
- `src/components/motion/motion.css` contains the intro stage, timeline progress, project masks, skill orbit details, and motion-specific responsive rules.
- `scripts/verify-motion.cjs` runs the production-browser regression.

## Behavior

- The intro appears only on the root page, only once per tab session, and only when reduced motion is not requested.
- Hash links, query links, refresh-after-intro, and reduced-motion users bypass the intro.
- Content is visible by default. The hook never leaves text hidden while waiting for JavaScript, observers, images, or fonts.
- Keyboard focus cancels any active reveal on the focused control or its ancestors.
- Project filtering and dynamic cards are rescanned with a mutation observer.
- Desktop adds subtle parallax depth and timeline progress. Mobile and reduced-motion paths remove depth transforms.
- There are no invented project screenshots. Project cards use masked light and color treatments because the repo has no project image assets.

## Verification

Run from `my-portfolio-frontend`:

```powershell
npm.cmd test -- --watchAll=false
npm.cmd run build
$env:PLAYWRIGHT_MODULE='C:\Users\alive\AppData\Local\npm-cache\_npx\e41f203b7505f1fb\node_modules\playwright'
$env:CHROME_PATH='C:\Program Files\Google\Chrome\Application\chrome.exe'
node scripts/verify-motion.cjs
```

The browser script serves the production build locally, mocks portfolio/contact API responses, blocks external browser traffic, and saves screenshots to `build/motion-checks`.
