# errorHandler.js Rewrite Plan

## Purpose

    - Gracefully handles errors

## Dependencies

    - None

## Functions / Hooks Needed

    - errorHandler(err, res) -> Takes in error name and returns the corresponsing status code, message, amd details. Also responds handles internal errors in prod
    - asyncHandler(fn) -> Takes in a function and resolves errors to avoid try catches

## Tasks:

    - [ ] Write errorHandler()
    - [ ] Write asyncHandler()
