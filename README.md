# Vivek Prakash - Portfolio

A recruiter-focused React portfolio at https://portfolio-frontend-one-ruddy.vercel.app. The Go API is in the separate [portfolio-backend repository](https://github.com/Vivek-Prakash1307/portfolio-backend) and runs at https://portfolio-backend-9kf0.onrender.com.

## Run and verify

```sh
npm ci
npm start
npm test -- --watchAll=false --runInBand
npm run build
```

Node 22 is used in CI and Docker. The production output is `build/`. All commands work from this repository alone; neither the backend source nor an API connection is required to build or view the portfolio. In PowerShell with script execution disabled, use `npm.cmd`.

For local API development, copy `.env.example` to `.env.local` and run the backend on port 8080. Never store email-service secrets in `REACT_APP_*`: these values are public in the compiled JavaScript.

## Features

- Search projects by name, description, or technology; combine category and technology filters.
- Project detail dialogs explain system flow, engineering focus, and stack, with repository and copyable deep links.
- Profile and project content remain available while the API is offline or waking up.
- Internship, education, coding profiles, resume download on mobile and desktop, and copy-email controls.
- Validated contact form with field feedback, character count, duplicate-submit protection, retry keys, network timeouts, and a direct-email fallback.
- Keyboard navigation, a skip link, focus-managed dialogs, reduced-motion support, optional animation pause, scroll progress, and back-to-top navigation.
- Personal metadata, structured profile data, a sitemap, and custom VP favicon.

## Structure

```text
src/app/                 page composition
src/components/layout/   navigation and shared layout
src/components/ui/       dialog, icons, copy controls, headings, error boundary
src/features/portfolio/  content loading and profile sections
src/features/projects/   project discovery and detail workflow
src/features/contact/    form, validation, and feedback
src/services/            API boundary, cancellation, errors, timeouts
src/hooks/               shared scrolling behavior
src/data/                committed content snapshot
src/styles/              site-wide visual system
scripts/                 content synchronization and validation
```

Feature styles and behavior tests live beside their components. `src/App.js` is a thin compatibility export. The existing React/CRA toolchain and dark mint visual direction are preserved.

## Content workflow

The canonical document is `content/portfolio.json` in the backend repository. With sibling checkouts named `my-portfolio-backend` and `my-portfolio-frontend`, run:

```sh
npm run content:sync
npm run content:check
```

For different checkout names, set `PORTFOLIO_SOURCE` to the absolute path of the backend JSON. The generated file is `src/data/portfolio.generated.json`. Commit that snapshot to this repository after changing canonical content in the backend. When no backend checkout exists, `content:check` validates the snapshot on its own; CI and Vercel do not download or depend on the other repo.

At runtime, the snapshot renders immediately. The API response replaces it only if the document has a complete, valid shape. Search and project details run locally, so they also work during Render cold starts.

See [Vercel deployment](docs/deployment.md) and [next improvements](docs/roadmap.md).
