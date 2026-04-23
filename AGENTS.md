# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm test` — run Mocha test suite (`test/**/*-test.js`, recursive, chai's expect pre-registered).
- `npm run lint` — ESLint with cache + Prettier check.
- `npm run test:lcov` — c8 coverage + mocha + lint. Mirrors CI.
- `npm run cov:html` — HTML coverage report to `coverage/`.
- `npm run dist` — regenerate README TOC and produce `dist/index.cjs` (CJS) + `dist/chronokinesis.cjs` (UMD, global `chronokinesis`) via Rollup.
- `npm run toc` — regenerate README TOC in place (`generate-api-toc.cjs`).
- Run a single test: `npx mocha test/chronokinesis-test.js --grep "stops time"`.
- `posttest` runs lint, dist, and `texample -g` (verifies README code samples compile/run). Keep README examples runnable.

Node ≥ 18 is supported (CI matrix: 18, 20, 22, 24, latest). `.nvmrc` pins the local dev version.

## Architecture

Single-file library: `index.js` (ESM source) + `index.d.ts` (hand-maintained types). `dist/` is generated — never edit directly.

### How time mocking works

The module swaps the global `Date` binding at runtime:

- `useFakeDate()` / `useNativeDate()` reassign `Date = FakeDate` or back to the stored native. This requires `"sideEffects": true` in package.json and is why ESLint's `no-global-assign` is disabled for source files.
- The original `Date` is stashed on `FakeDate[Symbol.for('chronokinesis native date')]` so repeated imports (or consumers who already replaced `Date`) don't lose the real constructor. When adding functionality, always reach through this symbol rather than capturing `Date` at module load.
- Module-level state: `freezedAt`, `traveledTo`, `started`, `iana`. `reset()` clears all four and restores the native `Date`. Any new feature that mutates time state must also be cleared in `reset()`.

### freeze vs travel vs combined

- `freeze` pins `FakeDate` to a fixed instant (`Date.now()` returns `freezedAt.getTime()`).
- `travel` records a target time plus a start anchor (`NativeDate.now()`); `time()` then computes `traveledTo + (NativeDate.now() - started)` so the clock keeps ticking from the travelled point.
- When both are active, `travel` overwrites `freezedAt` with the travel target — the clock stays frozen but at the new era. `defrost()` clears only `freezedAt`, which is how "start ticking from travelled time" is expressed.

### Timezone traveller

`TimeZoneTraveller` uses two `Intl.DateTimeFormat` instances (local UTC formatter + target-zone formatter) and `toUTC()` walks `formatToParts` to reconstruct a millisecond offset. `FakeDate.prototype.getTimezoneOffset` is overridden per-instance so that, while an IANA zone is active (`iana` set), offsets reflect the travelled zone. Tests in `test/timezone-test.js` cover DST boundaries — when editing `toUTC` or the getter, run timezone tests across DST transitions.

### Invalid-date handling

`freeze`/`travel` call `instantiate(Date, args)` and throw `TypeError` on `NaN`, but only after calling `reset()`. Preserve that ordering — consumers rely on "throw leaves the module in a clean state."

## Conventions

- Source is ESM (`"type": "module"`); CJS and UMD are build outputs only.
- No comments unless explaining a non-obvious invariant (e.g., why `Date` is reassigned, why native date is stashed via symbol).
- Public API must stay mirrored across `index.js`, `index.d.ts`, and the README TOC (run `npm run toc` after API changes).
- Tests import via the package name `chronokinesis` (see `test/chronokinesis-test.js`), not a relative path — this exercises the actual export map.
