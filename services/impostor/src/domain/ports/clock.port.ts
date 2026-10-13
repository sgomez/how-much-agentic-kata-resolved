/** Source of time, injected so tests are deterministic. */
export interface Clock {
  now: () => Date;
}
