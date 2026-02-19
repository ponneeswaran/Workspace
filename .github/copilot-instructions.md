# AI Agent Instructions for This Codebase

## Overview
This repository contains an Expo React Native application (Kanakkuvazhakku) plus a small local Node proxy used for AI/Gemini development.  Use the `Kanakkuvazhakku/` folder as the app root for all client-side commands.  By default, commit changes directly to the `main` branch unless you explicitly ask for a feature branch or PR workflow.

## Architecture (quick)
- Expo React Native app: `Kanakkuvazhakku/` — UI, screens, components, contexts, and services.
- Local dev proxy: `Kanakkuvazhakku/server/index.js` — used for Gemini/AI proxying in development.
- Utilities: `utils/` contains crypto, storage helpers and demo data.
- State: AppContext + AsyncStorage + SecureStore (BYOK, user session).

## Developer workflows (updated)
- Default branch policy: **Use `main` for changes by default**. Create feature branches only when explicitly requested (major or risky changes).
- Directory check: always run client commands from `Kanakkuvazhakku/` (cd there first).
- Start the app: cd into `Kanakkuvazhakku` then run `npx expo start`.
- Layout & safe-area: use `components/MainLayout.tsx` to wrap screens so they respect device safe areas (dynamic island / status bar). For standalone screens (Auth, Registration, Onboarding) pass `showFooter={false}` to hide the bottom footer while retaining safe-area insets.
- UI & component changes: when updating UI (e.g. `AddTransactionModal`, `ProfileEditView`, `Footer`) verify visual parity on iOS and Android, include screenshots in your commit/PR, and add a small unit/e2e test for behavioral changes where possible. Note: `AddTransactionModal` now surfaces categories as visible chips (with a Picker fallback) — verify chips are tappable and the Picker reflects the selected value.
- Start the local proxy (if needed): `npm run start:proxy` (run from `Kanakkuvazhakku`).
- Typecheck / lint / tests (run before pushing):
  - TypeScript: `npx tsc --noEmit`
  - Lint: `npm run lint` (runs `eslint . --ext .ts,.tsx`)
  - Tests: `npm test` (Jest — may be empty until tests are added)
- After edits: run the full pipeline above for any change touching logic or types.
- Commits & PRs: small fixes and routine changes may be committed directly to `main`. Open a PR only when you ask for review, or for large/risky upgrades.

## Branching & naming (when used)
- Branches are only used by request. When needed, follow `feat/...`, `fix/...`, `chore/...` conventions.

## Testing & CI
- Add unit/e2e tests and CI checks as part of the roadmap. For now run local `npx tsc --noEmit`, `npm run lint`, and `npm test`.

## Project conventions
- Follow standard TypeScript + React Native conventions.
- Keep translations in `translations/` and secure keys out of the client (use the proxy).

## Key files & places to look
- `Kanakkuvazhakku/` — main app folder
- `Kanakkuvazhakku/screens/` — screens (Profile, Home, History, etc.)
- `Kanakkuvazhakku/components/` — UI components (AddTransactionModal, ImageCropper, etc.)
- `Kanakkuvazhakku/services/geminiService.ts` — AI proxy + BYOK helpers
- `Kanakkuvazhakku/server/index.js` — local Gemini proxy for dev
- `Kanakkuvazhakku/utils/crypto.ts` — backup encryption helpers
- `Kanakkuvazhakku/package.json` — scripts: `start`, `lint`, `test`, `start:proxy`

---

Keep this document up to date — edit on `main` by default unless you explicitly ask for a branch/PR workflow.