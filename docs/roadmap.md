# Useful next additions

Prioritize evidence that helps engineering teams evaluate the work.

1. Add real screenshots, demo videos, and deeper case-study artifacts for the featured work. Describe constraints, alternatives, personal contributions, and lessons from debugging without exposing private company code or data.
2. Add reproducible performance benchmarks with scripts, hardware, dataset sizes, and measured results. Publish numerical claims only after measuring them.
3. Add two or three technical articles about Go backend reliability, PostgreSQL debugging, S3 storage architecture, or reliable data pipelines, linked to the corresponding work.
4. Add dated internship outcomes that can be shared publicly, keeping the resume and portfolio snapshot synchronized.
5. If frequent content editing becomes necessary, introduce a protected CMS with reviewed publish workflows. Git-managed content is sufficient for the current site.
6. If contact traffic grows, replace the single-instance outbox with Postgres and shared rate limiting, then add private delivery monitoring. Avoid a public message-status endpoint that could expose personal data.

A future toolchain migration to Vite or a prerendered React framework can improve build maintenance and SEO. Keep it separate from the current architecture and behavior upgrade so deployment regressions are easier to isolate.
