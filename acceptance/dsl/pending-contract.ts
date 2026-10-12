/**
 * Thrown by a driver method nobody has wired yet. Its message names what is
 * missing and who owns it, so `pnpm acceptance` reads like a board of the work left.
 */
export class PendingContractError extends Error {
  constructor({
    method,
    group,
    file,
  }: {
    method: string;
    group: string;
    file: string;
  }) {
    super(
      [
        `PendingContract: ${method} is not wired to the system yet.`,
        `  Owner: the ${group} group.`,
        `  Where: ${file}`,
        `  How:   agree the ${group} HTTP contract in packages/contracts/src/${group}/http.ts, then implement this method by calling it through player.http.`,
      ].join("\n")
    );
    this.name = "PendingContractError";
  }
}

/** Builds the `pending` helper of one driver file. */
export const pendingIn =
  (group: string, file: string) =>
  (method: string): never => {
    throw new PendingContractError({ file, group, method });
  };
