# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [7.0.0] - 2025-07-25

- attempt to mitigate issue #4 - multiple module load
- export FakeDate
- use prettier for formatting rules
- use texample to run through README examples
- test faking dates with luxon

## [6.0.0] - 2023-08-09

### Breaking

- timezone function calls travel by default #3
- timezone function signature also takes travel arguments

## [5.0.0] - 2023-04-10

- export as module with dist for require and umd

## [4.0.1] - 2022-12-09

- replace lab with mocha and chai
- default to node v14
- stop building node v10
- bump babel and rollup
- use c8 for coverage
