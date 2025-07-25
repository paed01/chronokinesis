/**
 * Freeze point in time.
 * @param args Same arguments as the `Date` constructor.
 */
export function freeze(...args: any[]): Date;
/**
 * Defrost a frozen point in time.
 * Used in combination with travelling will start ticking the clock.
 */
export function defrost(): void;
/**
 * Time travel to another era.
 * @param args Same arguments as Date constructor.
 */
export function travel(...args: any[]): Date;
/**
 * Resets Date to current glory.
 */
export function reset(): void;
/**
 * Utility function to see if we still travel or freeze time.
 */
export function isKeepingTime(): boolean;

/**
 * Fake date
 */
export class FakeDate extends Date {}

/**
 * Timezone traveling
 */
export class TimeZoneTraveller {
  /**
   *
   * @param timeZone IANA time zone
   */
  constructor(timeZone: string);
  /** IANA time zone */
  readonly timeZone: string;
  defrost: typeof defrost;
  reset: typeof reset;
  isKeepingTime: typeof isKeepingTime;
  freeze: typeof freeze;
  travel: typeof travel;
  /**
   * Get timezone datetime in milliseconds, like Date.getTime
   * @param args Same arguments as Date constructor.
   * @returns number of milliseconds since the epoch (January 1, 1970, UTC)
   */
  getTime(...args: any[]): number;
}

/**
 * Travel to time zone.
 * @param timeZone IANA time zone
 * @param args Optional travel to date arguments
 */
export function timezone(timeZone: string, ...args: any[]): TimeZoneTraveller;
