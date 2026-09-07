# Vercel deployment

Use the existing Vercel project connected to `Vivek-Prakash1307/portfolio-frontend` and preserve https://portfolio-frontend-one-ruddy.vercel.app.

| Setting | Value |
| --- | --- |
| Root Directory | Repository root (leave empty / `.`) |
| Framework | Create React App |
| Node | 22.x |
| Install | `npm ci` |
| Build | `npm run build` |
| Output | `build` |
| Production branch | `main` |
| `REACT_APP_API_URL` | Leave unset or set to an empty value |

The committed `vercel.json` defines framework/build/output settings, security headers, resume revalidation, and an `/api/*` rewrite to the existing Render service. Production code uses same-origin `/api` by default so mobile browsers submit the contact form through Vercel, then Vercel forwards the request to Render. Do not include `/api` or `/api/v1` in `REACT_APP_API_URL`; the client appends the route. Use `https://portfolio-backend-9kf0.onrender.com` only when serving the static frontend somewhere without the Vercel rewrite.

Review existing Dashboard variables: an old `REACT_APP_API_URL=http://localhost:8080` or direct Render URL will override the mobile-safe same-origin behavior and should be removed or changed to an empty value. [Environment changes apply only to new deployments](https://vercel.com/docs/environment-variables). `.env.local` is ignored and never committed. No backend secret belongs in Vercel's React build environment.

## Release order

1. Deploy the backend repository first and confirm `/api/v1/portfolio` returns the complete document and `/health/ready` is 200.
2. Run the frontend's content check, tests, and production build.
3. Push this repository's `main` branch and watch the connected Vercel deployment.
4. Check `/`, `/resume.pdf`, `/?project=http-load-balancer#work`, project filters, mobile navigation, and the contact form's validation.
5. Check Render allows `https://portfolio-frontend-one-ruddy.vercel.app` in `ALLOWED_ORIGINS`. Add exact Preview origins only when needed; contact from arbitrary preview URLs is not authorized by default.

Project links use query parameters and hashes, so there are no client-side pathname routes requiring a catch-all rewrite. Static files remain normal files. Personal canonical/social URLs are in `public/index.html`, `public/sitemap.xml`, and `public/robots.txt`; update these if you change domains.

The portfolio stays readable if Render is down or cold-starting. Email acceptance requires the backend's Resend configuration. A 202 means queued, not confirmed inbox delivery; the UI does not claim otherwise.

## Containers

`docker build -t portfolio-frontend .` builds this repository independently. The nginx runtime expects a reachable upstream named `backend` on port 8080; run it on the same Docker network as the API (the parent workspace's Compose example does this). Docker is an alternative local deployment, not needed by Vercel.

Official references: [CRA on Vercel](https://vercel.com/docs/frameworks/frontend/create-react-app), [rewrites](https://vercel.com/docs/routing/rewrites), [environment variables](https://vercel.com/docs/environment-variables).
