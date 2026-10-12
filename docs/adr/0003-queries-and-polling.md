---
status: accepted
---

# Communication by queries and polling, without push

Players must see the question, the reveal and the scoreboard almost at the same time, and some services depend on what happens in others: scoring needs the solution of each round and the outcome of the impostor vote. A player who loses the connection must get their full state back when they return. This is a proof of concept for a two-hour kata: time spent on real-time infrastructure is taken from the time the groups spend on the skills workflow, which is the point of the kata. So **nobody pushes anything; everything is asked for.**

- **Phones → server:** each screen asks for its **view** through the gateway about once a second (TanStack Query `refetchInterval`, wrapped in `useView` in `apps/web/src/shell`). Player actions (join, estimate, vote) are POSTs.
- **Service → service:** when a service needs something from another, it asks over HTTP through a port in `domain/ports/`, with an HTTP adapter and an in-memory adapter in `infra/`.
- **The view is per player.** Each GET returns what that player may see. That the impostor never receives the question is a domain rule of whichever service builds that view, covered by a unit test, not something the screen hides.
- **Service dependencies form no cycle.** If service A asks service B, B never asks A. The dependency graph between services is acyclic, so each one can be tested and started without waiting for a service that waits for it.
- **Service-to-service routes live under `/internal`.** The gateway never proxies them, so players cannot ask directly for data meant only for other services (solutions, who the impostor is).
- **Time is computed on read.** A round stores its end time and is over when `clock.now() > endsAt`. There are no timers on the server.
- **Reconnection is not a separate case.** Every request returns the full state, so a returning player gets theirs with the next one.

## Considered Options

- **SSE with an event relay in the gateway** (per-player audiences, delivery to subscribed services). Rejected for this PoC: it needs an event envelope, subscriptions, reconnection and duplicate handling, and every group would have to design events on top of queries.
- **POST for commands and an authenticated WebSocket for answers, with a message queue in SQLite emptied on delivery.** Valid and robust against disconnections. Rejected because it requires delivery acknowledgement and deciding who writes to the queue: if every service writes, they share a database.
- **WebSocket with a state snapshot on reconnect.** What we would choose in production: immediacy and reconnection without a queue. Rejected here because the gateway would have to manage authenticated connections and snapshots, which a PoC does not repay.
- **A broker (NATS, Redis pub/sub).** Rejected: one more process on every laptop, and browsers would still need the gateway.

## Consequences

- The contracts in `@hmk/contracts` are HTTP only: there are no event schemas.
- A service may compute what it shows on read instead of storing it; for example, scoring could store only what it owns and work out the points each time someone asks, by asking other services for what it needs.
- There is up to one second of delay. With rounds of a couple of minutes it does not affect the game.
- The load is one request per player per second: about 20 per second in the final game.
- Acceptance tests wait by polling until a condition holds, with no message inboxes.
- Moving to push later only changes the web shell and the gateway. Services already expose the view that would be pushed.
