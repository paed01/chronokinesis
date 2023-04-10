chronokinesis
=============
[![Build Status](https://app.travis-ci.com/paed01/chronokinesis.svg?branch=master)](https://app.travis-ci.com/paed01/chronokinesis) [![Coverage Status](https://coveralls.io/repos/github/paed01/chronokinesis/badge.svg?branch=master)](https://coveralls.io/github/paed01/chronokinesis?branch=master)

Mock time and date for traveling and freezing. Inspired and borrowed from [timekeeper](https://github.com/vesln/timekeeper).

<!-- toc -->

- [Introduction](#introduction)
- [API Reference](#api-reference)
  - [`freeze([...args])`](#freezeargs)
  - [`travel([...args])`](#travelargs)
  - [`defrost()`](#defrost)
  - [`reset()`](#reset)
  - [`isKeepingTime()`](#iskeepingtime)
  - [`timezone(timeZone)`](#timezonetimezone)
    - [timezone `freeze([...args])`](#timezone-freezeargs)
    - [timezone `travel([...args])`](#timezone-travelargs)
    - [timezone `reset()`](#timezone-reset)
    - [timezone `defrost()`](#timezone-defrost)
- [Distributions](#distributions)
  - [Nodejs require](#nodejs-require)
  - [Browser (UMD)](#browser-umd)
- [Acknowledgements](#acknowledgements)

<!-- tocstop -->

# Introduction

Mock `Date` and `Date.now` in order to help you test time-dependent code. Provides `travel`, `freeze`, and timezone functionality for your Node.js tests.

```javascript
import * as ck from 'chronokinesis';

ck.freeze();

setTimeout(() => {
  // Frozen
  console.log(new Date());

  ck.reset();
}, 2000);
```

or use with [`moment`](http://momentjs.com):

```javascript
import moment from 'moment';
import * as ck from 'chronokinesis';

ck.travel(moment().add(1, 'year'));

setTimeout(() => {
  // Date traveled one year and some
  console.log(new Date());

  ck.reset();
}, 2000);
```

# API Reference

## `freeze([...args])`

Freeze point in time. Calls can be made with the same arguments as the `Date` constructor.

- `...args`: Optional date constructor arguments, if empty stops time at now

```javascript
import * as ck from 'chronokinesis';

ck.freeze('1942-01-08');

setTimeout(() => {
  // Frozen
  console.log(new Date());

  ck.reset();
}, 2000);
```

## `travel([...args])`

Time travel to another era. Calls can be made with the same arguments as the `Date` constructor

- `...args`: Optional date constructor arguments, pretty useless if empty but won´t crash

```javascript
import * as ck from 'chronokinesis';
let date = new Date(2018, 0, 31);

ck.travel(date);

setTimeout(function() {
  console.log(new Date());
  ck.reset();
}, 1500);
```

When used in combination with [`freeze`](#freeze) the time is still frozen but at the travelled time().

```javascript
import * as ck from 'chronokinesis';
import moment from 'moment';

let date = new Date(2018, 0, 31);

ck.freeze(date);

ck.travel(moment().add(1, 'year'));

setTimeout(function() {
  console.log(`Still frozen but one year ahead ${new Date()}`);

  ck.reset();
}, 1500);
```

## `defrost()`

Defrost a frozen point in time. Used in combination with travelling will start ticking the clock.

```javascript
import * as ck from 'chronokinesis';

ck.freeze(1980, 0, 1);

// Travel one year
ck.travel(1981, 1, 1);

// Start ticking
ck.defrost();

setTimeout(() => {
  // Tick tack
  console.log(new Date());

  ck.reset();
}, 2000);
```

## `reset()`

Resets Date to current glory.

```javascript
import * as ck from 'chronokinesis';

ck.freeze(2060, 0, 1);
console.log(`end of time is reached at ${new Date()} according to Newton`)

ck.reset();

// Today
console.log(new Date())
```

## `isKeepingTime()`

Utility function to see if we still travel or freeze time.

```javascript
import * as ck from 'chronokinesis';

console.log(ck.isKeepingTime() ? 'Is' : 'Not', 'keeping time');
ck.travel(1893448800000);
console.log(ck.isKeepingTime() ? 'Is' : 'Not', 'keeping time');
```

## `timezone(timeZone)`

Freeze and travel in different time zones.

```javascript
import * as ck from 'chronokinesis';

const tz = ck.timezone('Asia/Shanghai');

tz.freeze();
```

### timezone `freeze([...args])`

Freeze at the specific timezone.

### timezone `travel([...args])`

Start traveling in the specific timezone.

### timezone `reset()`

Same as [#reset](#reset)

### timezone `defrost()`

Same as [#defrost](#defrost)

# Distributions

The module is prepared for browser and nodejs.

## Nodejs require

```js
const ck = require('chronokinesis');
```

## Browser (UMD)

Use `dist/chronokinesis.cjs`. Sets global property `chronokinesis`.

# Acknowledgements

chronokinesis initial code is inspired and borrowed from [timekeeper](https://github.com/vesln/timekeeper)
