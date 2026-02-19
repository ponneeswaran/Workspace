# Kanakkuvazhakku — Quick developer checklist

Small, focused README for daily development tasks and pre-push checklist.

## Quick start
- Open terminal and run: `cd Kanakkuvazhakku`
- Start Expo: `npx expo start`
- Layout / safe-area: screens should be wrapped with `MainLayout` (use `showFooter={false}` for Auth/Registration/Onboarding so the footer is hidden but safe-area insets are preserved)
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
- UI verification: for visual or layout changes (Add Transaction modal, Profile screens, Footer), check the UI on iOS and Android, ensure safe-area/dynamic-island spacing is correct, and include screenshots or a short e2e test for regressions. Specifically verify `Add Transaction` shows category chips and that the platform `Picker` stays synchronized with chip selection.

> NOTE: By default commit changes directly to the `main` branch for small fixes. Create a feature branch and open a PR only for large/risky changes or when you request code review.
