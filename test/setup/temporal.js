import { Temporal } from '@js-temporal/polyfill';

if (typeof globalThis.Temporal === 'undefined') globalThis.Temporal = Temporal;
