# jobs.js Rewrite Plan

## Purpose

-   Provide endpoints that server.js and other files can connect to to run functions

## Dependencies

-   Express
-   processJobMatching from `../services/jobService.js`
-   rateLimiter from `../middleware/rateLimiter.js`
-   asyncHandler from errorHandler.js

## Functions / Hooks Needed

-   `/match `-> starts matching jobs from the SQL database to the user. Uses rateLimiter, asyncHandler, and processJobMatching
-   `/status/:username` -> checks if the job matching to the user has been completed or if it still in progress. Uses asyncHandler

## Tasks:

-   [ ] Write /match
-   [ ] Write tests for /match
-   [ ] Write /status/:username
-   [ ] Write tests for /status/:username
