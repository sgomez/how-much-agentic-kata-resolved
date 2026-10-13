import { createStaticVerifier } from "@hmk/auth";
import { VotingView } from "@hmk/contracts/impostor";
import { describe, expect, it } from "vitest";

import { composeImpostor } from "../src/composition.ts";
import { RoundVoting } from "../src/domain/voting.aggregate.ts";
import { FixedClock } from "../src/infra/fixed-clock.adapter.ts";
import { MemoryVotingRepository } from "../src/infra/memory-voting-repository.adapter.ts";

const deadline = new Date("2026-01-01T10:00:00Z");
const candidates = [
  { id: "u1", nickname: "Ana" },
  { id: "u2", nickname: "Beto" },
  { id: "u3", nickname: "Cleo" },
];
const tokens = {
  "ana-token": { id: "u1", name: "Ana" },
  "beto-token": { id: "u2", name: "Beto" },
  "cleo-token": { id: "u3", name: "Cleo" },
  "out-token": { id: "u9", name: "Out" },
};

// Roll 0.5 picks the second candidate, Beto, as the impostor.
const setup = async ({ now = deadline } = {}) => {
  const votings = new MemoryVotingRepository();
  await votings.save(
    RoundVoting.choose({
      candidates,
      deadline,
      gameCode: "G1",
      hostId: "u1",
      roll: 0.5,
      round: 1,
    })
  );
  const app = composeImpostor({
    clock: new FixedClock(now),
    verifier: createStaticVerifier(tokens),
    votings,
  });
  const call = (
    who: string,
    method: "GET" | "POST",
    path: string,
    body?: unknown
  ) =>
    app.request(path, {
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: {
        authorization: `Bearer ${who}-token`,
        ...(body === undefined ? {} : { "content-type": "application/json" }),
      },
      method,
    });
  return {
    call,
    close: (who: string) => call(who, "POST", "/G1/1/voting/close"),
    open: (who: string) => call(who, "POST", "/G1/1/voting"),
    view: async (who: string) => {
      const res = await call(who, "GET", "/G1/1");
      return VotingView.parse(await res.json());
    },
    vote: (who: string, suspectNickname: string) =>
      call(who, "POST", "/G1/1/votes", { suspectNickname }),
  };
};

const code = async (res: Response) =>
  ((await res.json()) as { error: { code: string } }).error.code;

describe("voting view", () => {
  it("shows a pending voting to a candidate without the impostor", async () => {
    const { view } = await setup();

    await expect(view("cleo")).resolves.toStrictEqual({
      candidates,
      impostorId: null,
      verdict: null,
      voters: [],
      voting: "pending",
    });
  });

  it("refuses a player who is not a candidate", async () => {
    const { call } = await setup();

    const res = await call("out", "GET", "/G1/1");

    expect(res.status).toBe(403);
    await expect(code(res)).resolves.toBe("not-a-player");
  });

  it("answers 404 for an unknown round", async () => {
    const { call } = await setup();

    const res = await call("ana", "GET", "/G1/2");

    expect(res.status).toBe(404);
    await expect(code(res)).resolves.toBe("round-not-found");
  });
});

describe("opening the voting", () => {
  it("lets the host open it, twice without harm", async () => {
    const { open, view } = await setup();

    const first = await open("ana");
    const second = await open("ana");

    expect([first.status, second.status]).toStrictEqual([204, 204]);
    await expect(view("cleo")).resolves.toMatchObject({ voting: "open" });
  });

  it("refuses a player who is not the host", async () => {
    const { open } = await setup();

    const res = await open("beto");

    expect(res.status).toBe(403);
    await expect(code(res)).resolves.toBe("not-the-host");
  });

  it("refuses to open before the deadline", async () => {
    const { open } = await setup({ now: new Date("2026-01-01T09:59:59Z") });

    const res = await open("ana");

    expect(res.status).toBe(409);
    await expect(code(res)).resolves.toBe("round-not-revealed");
  });

  it("refuses to open a voting that is over", async () => {
    const { close, open } = await setup();
    await open("ana");
    await close("ana");

    const res = await open("ana");

    expect(res.status).toBe(409);
    await expect(code(res)).resolves.toBe("voting-over");
  });
});

describe("casting a vote", () => {
  it("records the vote of the token's id without revealing it", async () => {
    const { open, view, vote } = await setup();
    await open("ana");

    const res = await vote("cleo", " beto ");

    expect(res.status).toBe(204);
    await expect(view("ana")).resolves.toMatchObject({
      impostorId: null,
      voters: ["u3"],
      voting: "open",
    });
  });

  it("ends the voting with the last vote", async () => {
    const { open, view, vote } = await setup();
    await open("ana");
    await vote("ana", "Beto");
    await vote("beto", "Ana");
    await vote("cleo", "Beto");

    await expect(view("ana")).resolves.toMatchObject({
      impostorId: "u2",
      verdict: "caught",
      voting: "over",
    });
  });

  it("refuses a vote while the voting is not open", async () => {
    const { vote } = await setup();

    const res = await vote("cleo", "Beto");

    expect(res.status).toBe(409);
    await expect(code(res)).resolves.toBe("voting-not-open");
  });

  it("refuses a second vote", async () => {
    const { open, vote } = await setup();
    await open("ana");
    await vote("cleo", "Beto");

    const res = await vote("cleo", "Ana");

    expect(res.status).toBe(409);
    await expect(code(res)).resolves.toBe("already-voted");
  });

  it("refuses a vote for yourself", async () => {
    const { open, vote } = await setup();
    await open("ana");

    const res = await vote("cleo", "cleo");

    expect(res.status).toBe(422);
    await expect(code(res)).resolves.toBe("self-vote");
  });

  it("refuses a vote for an unknown nickname", async () => {
    const { open, vote } = await setup();
    await open("ana");

    const res = await vote("cleo", "Zoe");

    expect(res.status).toBe(422);
    await expect(code(res)).resolves.toBe("unknown-suspect");
  });

  it("refuses a vote from a non-candidate", async () => {
    const { open, vote } = await setup();
    await open("ana");

    const res = await vote("out", "Beto");

    expect(res.status).toBe(403);
    await expect(code(res)).resolves.toBe("not-a-player");
  });

  it("rejects a body without suspectNickname", async () => {
    const { call, open } = await setup();
    await open("ana");

    const res = await call("cleo", "POST", "/G1/1/votes", {});

    expect(res.status).toBe(400);
  });
});

describe("closing the voting", () => {
  it("lets the host close it early: an impostor nobody voted for escapes", async () => {
    const { close, open, view } = await setup();
    await open("ana");

    const res = await close("ana");

    expect(res.status).toBe(204);
    await expect(view("cleo")).resolves.toMatchObject({
      impostorId: "u2",
      verdict: "escaped",
      voting: "over",
    });
    const again = await close("ana");
    expect(again.status).toBe(204);
  });

  it("refuses a player who is not the host", async () => {
    const { close, open } = await setup();
    await open("ana");

    const res = await close("beto");

    expect(res.status).toBe(403);
    await expect(code(res)).resolves.toBe("not-the-host");
  });

  it("refuses to close a voting that is not open", async () => {
    const { close } = await setup();

    const res = await close("ana");

    expect(res.status).toBe(409);
    await expect(code(res)).resolves.toBe("voting-not-open");
  });
});
