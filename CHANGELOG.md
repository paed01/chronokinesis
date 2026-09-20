# Changelog

All notable changes to this project will be documented in this file.

## v8.1.0 - 2026-09-20

- mock native `Temporal.Now` (Node >= 26) alongside `Date`, `Temporal.Now.timeZoneId()` honours timezone travel

## v8.0.1 - 2026-09-13

- use nullish coalescing and optional chaining internally, browser bundle now requires ES2020
- replace `markdown-toc` script with `@0dep/toc`
- drop build with node v18 due to dev deps

## v8.0.0 - 2026-04-24

### Breaking

- mocks `process.hrtime([time])` and `process.hrtime.bigint()`
- mocks `performance.now()`

### Fixes

- fix bug in travel that resulted in consumed milliseconds before returning

## v7.0.1 - 2025-11-13

- proof of provenance release

## v7.0.0 - 2025-07-25

### Breaking

- when declaring "exports" field in package.json it takes prescedence over "main", thus breaking the exports default. Use `import * as ck from 'chronokinesis';`. A simple search & replace should fix this.

### Fixes

- attempt to mitigate issue #4 - multiple module load
- export FakeDate
- test faking dates with luxon
- use prettier for formatting rules
- use texample to run through README examples

## v6.0.0 - 2023-08-09

### Breaking

- timezone function calls travel by default #3
- timezone function signature also takes travel arguments

## v5.0.0 - 2023-04-10

- export as module with dist for require and umd

## v4.0.1 - 2022-12-09

- replace lab with mocha and chai
- default to node v14
- stop building node v10
- bump babel and rollup
- use c8 for coverage
