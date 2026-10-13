/** Source of game codes, injected so tests are deterministic. */
export interface CodeGenerator {
  /** Four upper-case letters, never I or O. Not necessarily unused. */
  next: () => string;
}
