# jobService.js Rewrite Plan

## Purpose

    - Holds all of the functions related to jobs.

## Dependencies

    - Database
    - gemni in `./gemniService.js`
    - getUserResponses, saveWeightedJobsToDataBase in `./userService.js`
    - createBatches, formatResults, displayTopMatches in `../utils/jobUtils.js`
    - extractSkillsFromJobs in `../utils/skillUtils.js`

## Functions / Hooks Needed

    - /getJobData -> gets the job data from the data base
    - /processJobMatching -> takes in a username; uses the userName to ```getUserResponses()```.
        - Then it ```extractSkillsFromJobs(jobs)``` saving them to the dataBase.
        - It then gets the batches by calling ```createBatches(jobs, BATCH_SIZE)```.
        - For loop calling `getJobWeightsBatchSimple(batches[i], responses, batchinfo)` garbage collection every 20 batches.
        - Uses rate limiting to make sure it doesn't go too fast.
        - Calls `formatResults(jobs, allWeights, startTime)`
        - Saves the results to the dataBase `saveWeightedJobsToDataBase(username, results)` calling `displayTopMatches` to the terminal from checking.

## Tasks:

    - [ ] Write /getJobData
    - [ ] Write tests for /getJobData
    - [ ] Write /processJobMatching
    - [ ] Write tests for /processJobMatching
