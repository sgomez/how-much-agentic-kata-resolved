/** Source of randomness, injected so tests are deterministic. */
export interface Random {
  /** A number in [0, 1). */
  next: () => number;
}
