# roadmapService.js Rewrite Plan

## Purpose

Sets up the the roadmap using claude.

## Dependencies

-   Anthropic in `@anthropic-ai/sdk`
-   Database

## Functions / Hooks Needed

-   `generateRoadmap(userId)` generates roadmap with claude calling `generateRoadmapWithClaude(responses, skills)`
-   `generateRoadmapWithClaude(responses, skills)` controls the prompt and claude calling
-   File is orginially had methods for formatting responses and skills

## Tasks:

    - [ ] Write ```generateRoadmap(userId)```
    - [ ] Write test for ```generateRoadmap(userId)```
    - [ ] Write ```generateRoadmap(userId)```
    - [ ] Write test for ```generateRoadmap(userId)```
