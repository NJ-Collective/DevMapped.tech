# jobs.js Rewrite Plan

## Purpose

    - Holds all of the functions related to jobs.

## Dependencies

    - Database
    - getJobWeightsBatchSimple from embeddedService.js
    -

## Functions / Hooks Needed

    - /match -> starts matching jobs from the database to the user. Uses rateLimiter, asyncHandler, and processJobMatching
    - /status/:username -> checks if the job matching to the user has been completed or if it still in progress. Uses asyncHandler

## Tasks:

    - [ ] Write /match
    - [ ] Write tests for /match
    - [ ] Write /status/:username
    - [ ] Write tests for /status/:username
