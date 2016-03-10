chronokinesis
=============

[![Build Status](https://travis-ci.org/paed01/chronokinesis.svg?branch=master)](https://travis-ci.org/paed01/chronokinesis) [![Coverage Status](https://coveralls.io/repos/github/paed01/chronokinesis/badge.svg?branch=master)](https://coveralls.io/github/paed01/chronokinesis?branch=master)

## Description

This module mocks `Date` and `Date.now` in order to help you test time-dependent code.
Provides `travel` and `freeze` functionality for your Node.js tests.

## `#freeze`

Freeze point in time. Can be used with arguments similar to the `Date` constructor.

```javascript
const tk = require('chronokinesis');
var time = new Date(1330688329321);

tk.freeze(time);

// The time hasn't changed at all.

let date = new Date();
let ms = Date.now();

ck.reset(); // Reset.

```

## `#travel`

```javascript
var ck = require('chronokinesis');
var time = new Date(1893448800000); // January 1, 2030 00:00:00

ck.travel(time); // Travel to that date.

setTimeout(function() {

  // `time` + ~500 ms.

  var date = new Date;
  var ms = Date.now();

  ck.reset(); // Reset.

}, 500);
```

## `#reset`

```javascript
var ck = require('chronokinesis');
var time = new Date(1893448800000); // January 1, 2030 00:00:00

ck.travel(time); // Travel to that date.

setTimeout(function() {

  // `time` + ~500 ms.

  var date = new Date;
  var ms = Date.now();

  ck.reset(); // Reset.

}, 500);
```

### `#isKeepingTime`

```javascript
var ck = require('chronokinesis');
var time = new Date(1893448800000); // January 1, 2030 00:00:00

assertFalse(ck.isKeepingTime());
ck.travel(time);
assertTrue(ck.isKeepingTime());
```

# Acknowledgements

chronokinesis initial code is borrowed from [timekeeper](https://github.com/vesln/timekeeper)
