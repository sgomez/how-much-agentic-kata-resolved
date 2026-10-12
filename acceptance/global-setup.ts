import { urlOf } from "@hmk/kit/topology";

/** Stops the run early, with one clear message, when the system is not up. */
export default async function checkTheSystemIsRunning(): Promise<void> {
  const gateway = urlOf("gateway");
  const healthy = await fetch(`${gateway}/health`).then(
    (res) => res.ok,
    () => false
  );
  if (!healthy) {
    console.error(
      `The gateway at ${gateway} is not answering. Start the system with \`pnpm dev\` in another terminal, then run \`pnpm acceptance\` again.`
    );
    process.exit(1);
  }
}
