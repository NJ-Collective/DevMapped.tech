# Dev Mapped

A team-built application that connects a user's career interests with job requirements and personalized learning roadmaps. Started at **Cal Hacks 12.0**, with intermittent improvements afterward.

[Hackathon project story](https://devpost.com/software/aa-0u7vs6)

## Project workflow

1. Collect the user's preferences and background.
2. Match the user with relevant job data.
3. Prioritize skills associated with those jobs.
4. Generate a learning roadmap organized into tasks and projects.

## Architecture

The repository has evolved from the original hackathon implementation. The current source includes:

- A React frontend with questionnaire and roadmap views.
- JavaScript backend services for user profiles, embeddings, job retrieval, weighted skills, and roadmap generation.
- PostgreSQL and Qdrant integrations for structured data and vector retrieval.
- A Gemini-based roadmap-generation service.

The original hackathon story describes an earlier stack; it should not be used as a setup guide for the current revision.

## Nate Smith's contribution

[Nate Smith](https://github.com/nathsmith-cs) built the initial Node.js job-ranking pipeline using Groq and Firebase Firestore. It processed job listings against questionnaire responses in batches and stored ranked results. He restructured persistence into a compact user summary, batched job weights, and paginated top matches to limit document payload size.

He also developed a local skill-analysis prototype combining LLM extraction with structured-field and text matching to generate skill-gap recommendations. That local prototype is separate from the current repository's skill service. These contributions were part of a team effort; see the [project credits](https://devpost.com/software/aa-0u7vs6).

## Repository guide

- `frontend/src/` — application views, forms, hooks, and client services.
- `backend/src/services/` — matching, skills, user, and roadmap services.
- `backend/src/utils/` — job and database utilities.
- `config/` — shared configuration.
- `scripts/` — data import and documentation utilities.

## Development status

This is an evolving team project, not a packaged application with a verified one-command setup. The root package currently provides a `docs` script; application start scripts, service configuration, and an end-to-end setup guide still need to be consolidated.

Use a separate development database when exploring data-processing scripts: the current skill service clears the weighted-skills table before rebuilding it.

## Next improvements

- Document reproducible local setup and required environment variables.
- Validate the roadmap-generation response handling end to end.
- Add tests for job matching, weighted skills, and per-user data isolation.
