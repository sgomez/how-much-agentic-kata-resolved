/** Port for current time, so tests can control time. */
export interface ClockPort {
  now: () => Date;
}
