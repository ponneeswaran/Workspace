# Kanakkuvazhakku — Quick developer checklist

Small, focused README for daily development tasks and pre-push checklist.

## Quick start
- Open terminal and run: `cd Kanakkuvazhakku`
- Start Expo: `npx expo start`
- Start local AI proxy (dev only): `npm run start:proxy`

## Important commands
- Typecheck: `npx tsc --noEmit`
- Lint: `npm run lint` (runs `eslint . --ext .ts,.tsx`)
- Tests: `npm test` (Jest — may be empty until tests are added)

## Pre-push checklist ✅
Before you commit and push any change, run these and fix failures:
- Run `npx tsc --noEmit` and fix type errors
- Run `npm run lint` and address lint warnings/errors
- Run `npm test` and ensure tests pass (or add tests for new logic)
- Confirm the app still runs locally (`npx expo start`) when applicable

> NOTE: By default commit changes directly to the `main` branch for small fixes. Create a feature branch and open a PR only for large/risky changes or when you request code review.
