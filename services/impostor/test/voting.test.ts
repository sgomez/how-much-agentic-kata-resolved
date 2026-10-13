import { describe, expect, it } from "vitest";

import { CastVote } from "../src/application/cast-vote.use-case.ts";
import { ChooseImpostor } from "../src/application/choose-impostor.use-case.ts";
import { CloseVoting } from "../src/application/close-voting.use-case.ts";
import { GetVerdict } from "../src/application/get-verdict.query.ts";
import { GetVotingView } from "../src/application/get-voting-view.query.ts";
import { OpenVoting } from "../src/application/open-voting.use-case.ts";
import { FixedClock } from "../src/infra/fixed-clock.adapter.ts";
import { MemoryVotingRepository } from "../src/infra/memory-voting-repository.adapter.ts";
import { SequenceRandom } from "../src/infra/sequence-random.adapter.ts";

const deadline = new Date("2026-01-01T10:00:00.000Z");
const candidates = [
  { id: "u1", nickname: "Ana" },
  { id: "u2", nickname: "Beto" },
  { id: "u3", nickname: "Carla" },
];

const setup = (rolls = [0.5]) => {
  const votings = new MemoryVotingRepository();
  const clock = new FixedClock(deadline);
  return {
    cast: new CastVote({ votings }),
    choose: new ChooseImpostor({ random: new SequenceRandom(rolls), votings }),
    clock,
    close: new CloseVoting({ votings }),
    open: new OpenVoting({ clock, votings }),
    verdict: new GetVerdict({ votings }),
    view: new GetVotingView({ votings }),
  };
};

const round = { gameCode: "ABCD", round: 1 };
const chooseInput = {
  ...round,
  candidates,
  deadline,
  hostId: "u1",
};
const vote = (voterId: string, suspectNickname: string) => ({
  ...round,
  suspectNickname,
  userId: voterId,
});

/** The impostor is Beto (roll 0.5 of three candidates). */
const openVoting = async (rolls?: number[]) => {
  const s = setup(rolls);
  await s.choose.execute(chooseInput);
  await s.open.execute({ ...round, userId: "u1" });
  return s;
};

describe("choosing the impostor", () => {
  it("picks the candidate the random roll points at", async () => {
    const { choose } = setup([0.99]);

    const result = await choose.execute(chooseInput);

    expect(result).toStrictEqual({ created: true, impostorId: "u3" });
  });

  it("can pick the host", async () => {
    const { choose } = setup([0]);

    const result = await choose.execute(chooseInput);

    expect(result.impostorId).toBe("u1");
  });

  it("returns the same impostor when asked again, even with another roll", async () => {
    const { choose } = setup([0, 0.99]);
    await choose.execute(chooseInput);

    const again = await choose.execute(chooseInput);

    expect(again).toStrictEqual({ created: false, impostorId: "u1" });
  });

  it("keeps the first deadline when asked again", async () => {
    const s = setup([0.5, 0.5]);
    await s.choose.execute(chooseInput);
    await s.choose.execute({
      ...chooseInput,
      deadline: new Date("2030-01-01T00:00:00.000Z"),
    });

    await expect(
      s.open.execute({ ...round, userId: "u1" })
    ).resolves.toBeUndefined();
  });

  it("rejects fewer than two candidates", async () => {
    const { choose } = setup();

    await expect(
      choose.execute({ ...chooseInput, candidates: candidates.slice(0, 1) })
    ).rejects.toMatchObject({ kind: "invalid" });
  });

  it("rejects repeated candidate ids", async () => {
    const { choose } = setup();

    await expect(
      choose.execute({
        ...chooseInput,
        candidates: [
          { id: "u1", nickname: "Ana" },
          { id: "u1", nickname: "Other" },
        ],
      })
    ).rejects.toMatchObject({ kind: "invalid" });
  });
});

describe("opening the voting", () => {
  it("is refused before the deadline", async () => {
    const s = setup();
    await s.choose.execute(chooseInput);
    s.clock.set(new Date("2026-01-01T09:59:59.999Z"));

    await expect(
      s.open.execute({ ...round, userId: "u1" })
    ).rejects.toMatchObject({ code: "round-not-revealed" });
  });

  it("is refused for anyone but the host", async () => {
    const s = setup();
    await s.choose.execute(chooseInput);

    await expect(
      s.open.execute({ ...round, userId: "u2" })
    ).rejects.toMatchObject({ code: "not-the-host" });
  });

  it("changes nothing when it is already open", async () => {
    const s = await openVoting();
    await s.cast.execute(vote("u1", "Beto"));

    await s.open.execute({ ...round, userId: "u1" });

    const view = await s.view.execute("ABCD", 1, "u1");
    expect(view).toMatchObject({ voters: ["u1"], voting: "open" });
  });

  it("is refused once the voting is over", async () => {
    const s = await openVoting();
    await s.close.execute({ ...round, userId: "u1" });

    await expect(
      s.open.execute({ ...round, userId: "u1" })
    ).rejects.toMatchObject({ code: "voting-over" });
  });

  it("fails for a round without impostor", async () => {
    const s = setup();

    await expect(
      s.open.execute({ ...round, userId: "u1" })
    ).rejects.toMatchObject({ code: "round-not-found" });
  });
});

describe("casting a vote", () => {
  it("is refused for someone who is not a candidate", async () => {
    const s = await openVoting();

    await expect(s.cast.execute(vote("zz", "Ana"))).rejects.toMatchObject({
      code: "not-a-player",
    });
  });

  it("is refused while the voting is pending", async () => {
    const s = setup();
    await s.choose.execute(chooseInput);

    await expect(s.cast.execute(vote("u1", "Beto"))).rejects.toMatchObject({
      code: "voting-not-open",
    });
  });

  it("is refused twice", async () => {
    const s = await openVoting();
    await s.cast.execute(vote("u1", "Beto"));

    await expect(s.cast.execute(vote("u1", "Carla"))).rejects.toMatchObject({
      code: "already-voted",
    });
  });

  it("is refused for yourself", async () => {
    const s = await openVoting();

    await expect(s.cast.execute(vote("u1", "Ana"))).rejects.toMatchObject({
      code: "self-vote",
    });
  });

  it("is refused for a nickname no candidate has", async () => {
    const s = await openVoting();

    await expect(s.cast.execute(vote("u1", "Zoe"))).rejects.toMatchObject({
      code: "unknown-suspect",
    });
  });

  it("matches the nickname ignoring case and spaces at either end", async () => {
    const s = await openVoting();

    await s.cast.execute(vote("u1", "  bETo "));

    const view = await s.view.execute("ABCD", 1, "u1");
    expect(view.voters).toStrictEqual(["u1"]);
  });

  it("ends the voting with the last candidate's vote", async () => {
    const s = await openVoting();
    await s.cast.execute(vote("u1", "Beto"));

    const mid = await s.view.execute("ABCD", 1, "u1");
    await s.cast.execute(vote("u3", "Beto"));
    const view = await s.view.execute("ABCD", 1, "u1");

    expect([mid.voting, view.voting]).toStrictEqual(["open", "over"]);
  });

  it("is refused for the impostor, who does not vote", async () => {
    const s = await openVoting();

    await expect(s.cast.execute(vote("u2", "Ana"))).rejects.toMatchObject({
      code: "impostor-cannot-vote",
      kind: "forbidden",
    });
  });

  it("leaves the voting open after the impostor's refused vote", async () => {
    const s = await openVoting();
    await s.cast.execute(vote("u1", "Beto"));
    await s.cast.execute(vote("u2", "Ana")).catch(() => {});

    const view = await s.view.execute("ABCD", 1, "u1");

    expect(view.voting).toBe("open");
  });

  it("is refused once the voting is over", async () => {
    const s = await openVoting();
    await s.close.execute({ ...round, userId: "u1" });

    await expect(s.cast.execute(vote("u1", "Beto"))).rejects.toMatchObject({
      code: "voting-not-open",
    });
  });
});

describe("closing the voting", () => {
  it("is refused for anyone but the host", async () => {
    const s = await openVoting();

    await expect(
      s.close.execute({ ...round, userId: "u2" })
    ).rejects.toMatchObject({ code: "not-the-host" });
  });

  it("is refused while the voting is pending", async () => {
    const s = setup();
    await s.choose.execute(chooseInput);

    await expect(
      s.close.execute({ ...round, userId: "u1" })
    ).rejects.toMatchObject({ code: "voting-not-open" });
  });

  it("ends the voting even if someone has not voted", async () => {
    const s = await openVoting();
    await s.cast.execute(vote("u1", "Beto"));

    await s.close.execute({ ...round, userId: "u1" });

    const view = await s.view.execute("ABCD", 1, "u1");
    expect(view.voting).toBe("over");
  });

  it("changes nothing once the voting is over", async () => {
    const s = await openVoting();
    await s.cast.execute(vote("u1", "Beto"));
    await s.close.execute({ ...round, userId: "u1" });
    const before = await s.verdict.execute("ABCD", 1);

    await s.close.execute({ ...round, userId: "u1" });

    await expect(s.verdict.execute("ABCD", 1)).resolves.toStrictEqual(before);
  });
});

describe("the verdict", () => {
  it("is null with the impostor while the voting is not over", async () => {
    const s = await openVoting();
    await s.cast.execute(vote("u1", "Beto"));

    await expect(s.verdict.execute("ABCD", 1)).resolves.toStrictEqual({
      impostorId: null,
      verdict: null,
    });
  });

  it("is caught when the impostor alone has the most votes", async () => {
    const s = await openVoting();
    await s.cast.execute(vote("u1", "Beto"));
    await s.cast.execute(vote("u3", "Beto"));

    await expect(s.verdict.execute("ABCD", 1)).resolves.toStrictEqual({
      impostorId: "u2",
      verdict: "caught",
    });
  });

  it("is escaped when someone else has the most votes", async () => {
    const s = await openVoting();
    await s.cast.execute(vote("u1", "Carla"));
    await s.cast.execute(vote("u3", "Ana"));

    await expect(s.verdict.execute("ABCD", 1)).resolves.toMatchObject({
      verdict: "escaped",
    });
  });

  it("is escaped on a tie for the most votes, the impostor included", async () => {
    const s = await openVoting();
    await s.cast.execute(vote("u1", "Beto"));
    await s.cast.execute(vote("u3", "Ana"));

    await expect(s.verdict.execute("ABCD", 1)).resolves.toMatchObject({
      verdict: "escaped",
    });
  });

  it("is escaped when nobody voted", async () => {
    const s = await openVoting();
    await s.close.execute({ ...round, userId: "u1" });

    await expect(s.verdict.execute("ABCD", 1)).resolves.toStrictEqual({
      impostorId: "u2",
      verdict: "escaped",
    });
  });

  it("does not exist for a round without impostor", async () => {
    const s = setup();

    await expect(s.verdict.execute("ABCD", 1)).rejects.toMatchObject({
      code: "round-not-found",
    });
  });
});

describe("the voting view", () => {
  it("shows who voted but not whom for, and hides the impostor until over", async () => {
    const s = await openVoting();
    await s.cast.execute(vote("u1", "Beto"));

    const view = await s.view.execute("ABCD", 1, "u3");

    expect(view).toStrictEqual({
      candidates,
      impostorId: null,
      verdict: null,
      voters: ["u1"],
      voting: "open",
    });
  });

  it("is refused to someone who is not a candidate", async () => {
    const s = await openVoting();

    await expect(s.view.execute("ABCD", 1, "zz")).rejects.toMatchObject({
      code: "not-a-player",
    });
  });
});
