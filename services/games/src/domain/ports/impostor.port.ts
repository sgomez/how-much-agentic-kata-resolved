import type { Verdict } from "@hmk/contracts/impostor";

/** The impostor service, as games needs it. */
export interface ImpostorPort {
  /**
   * The verdict of round `number`, or null while its voting is not over.
   * Every round of an impostor game has an impostor, so a round impostor does
   * not know is a failure, thrown as it comes: never a pass.
   */
  verdict: (code: string, number: number) => Promise<Verdict | null>;
}
