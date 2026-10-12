# @hmk/ui components

Every screen in `apps/web` is built from these components. Import them from `@hmk/ui` and nothing else. Run `pnpm storybook` to see every component and state, plus the example screens under `Patterns/`. The strings you pass in are Spanish (Spain). Numbers go through `formatNumber` or `formatWithUnit` (es-ES: `1.234.567,5`, `45 %`).

Each `Patterns/` screen carries a coloured badge (`games`, `rounds`, `scoring`, `impostor`) for every group whose data it shows, so you can see which screens your service has to feed and which other services you have to ask; to see only yours, open the tag filter next to the sidebar search and tick your group.

The rules for a screen:

- One `Screen` per route. In-game screens get a `TopBar`. The main action is one `Button size="lg" fullWidth` inside `BottomActionBar`. `ConnectionBanner` goes in `Screen`'s `banner`; `Toast` and `BottomSheet` go in its `overlays`.
- Lay out with `Stack` and `Grid`. Never hard-code colours, sizes or fonts. Use only the token utilities: `bg-surface`, `text-ink`, `text-ink-muted`, `border-line`, `gap-4`, `rounded-lg`. Tailwind's default palette is switched off.
- Feed components straight from the one-second poll: they re-render with the same values without flicker. Keep the ruler's `value` in local state and send it when the player presses Enviar or Cambiar.
- A disabled main button always says why, in `BottomActionBar`'s `hint`.

## Which components for which screen

| Screen | Start from | Example story |
| --- | --- | --- |
| Nickname | `Screen centered`, `Heading`, `Input`, `BottomActionBar` | Patterns/01 Nickname |
| Home: create or join | `TopBar`, `CodeInput`, `Button` | Patterns/02 Home |
| Lobby | `GameCodeDisplay`, `PlayerList`, `Stepper`, `Switch`, `ChipGroup`, `SegmentedControl` (host) or `DetailList` (others) | Patterns/03 Lobby |
| Round | `TopBar` + `Countdown`, `QuestionCard`, `EstimateRuler`, `AnswerTracker` | Patterns/04 Round |
| After sending | `EstimateRuler sentValue`, `AnswerTracker`, `PlayerList showAnswerStatus` | Patterns/05 After sending |
| Reveal | `RevealRuler`, `RevealList`, `ScoreDelta` | Patterns/06 Reveal |
| Voting (impostor) | `Grid` of `VoteOption` | Patterns/07 Voting |
| Verdict | `VerdictCard`, `ScoreDelta` | Patterns/08 Verdict |
| Scoreboard | `Scoreboard` | Patterns/09 Scoreboard |
| Final ranking | `FinalPodium` | Patterns/10 Final ranking |
| Errors and empty lists | `EmptyState`, `ConnectionBanner` | Patterns/11 Errors |

The patterns are examples, not the product. Where an open product rule changes a screen, the patterns show every variant side by side. Your group picks one: see [`docs/open-decisions.md`](docs/open-decisions.md) for the props each variant needs.

## Layout and text

- **Screen**: the full-height page shell, with a sticky top bar, a scrolling middle and a sticky bottom bar. `<Screen top={<TopBar gameCode="KQZT" />} bottom={<BottomActionBar><Button size="lg" fullWidth>Empezar</Button></BottomActionBar>}>…</Screen>`
- **Stack**: a column or a row with a token gap. `<Stack gap={6}>…</Stack>` · `<Stack direction="row" gap={2} align="center">…</Stack>`
- **Grid**: equal-width tiles. `<Grid cols={2}>{players.map((p) => <VoteOption key={p.id} player={p} />)}</Grid>`
- **Heading**: a title in the display face; `size="display"` for hero titles. `<Heading level={1}>¿Quién era el impostor?</Heading>`
- **Text**: body copy with a size and a tone. `<Text size="sm" tone="muted">7 de 12 han respondido</Text>`
- **Card**: a raised, sunken, yellow or pink container. `<Card tone="sunken">…</Card>`
- **DetailList**: read-only label and value rows, such as the lobby settings for non-hosts. `<DetailList items={[{ label: "Rondas", value: "10" }]} />`

## Actions and inputs

- **Button**: a labelled action, with one primary per screen; `type="submit"` inside a form. `<Button size="lg" fullWidth icon="send" disabled={value === null}>Enviar</Button>`
- **IconButton**: an icon-only button that always has a label. `<IconButton icon="copy" label="Copiar código" onClick={copy} />`
- **Input**: a text field with a label, a hint and an error; `onChange` receives the string. `<Input label="Tu apodo" value={name} onChange={setName} maxLength={16} />`
- **CodeInput**: the game-code boxes. It uppercases, accepts pasted codes and advances on its own; length and alphabet are props. `<CodeInput value={code} onChange={setCode} length={4} alphabet="letters" onComplete={join} />`
- **Stepper**: a small number with − and +. `<Stepper label="Rondas" value={rounds} onChange={setRounds} min={1} max={20} />`
- **Switch**: an on/off setting. `<Switch label="Modo impostor" checked={on} onChange={setOn} />`
- **ChipGroup**: multi-select chips, such as question packs. `<ChipGroup label="Paquetes de preguntas" options={packs} value={selected} onChange={setSelected} />`
- **SegmentedControl**: pick one of 2 to 4 options. `<SegmentedControl label="Siguiente ronda" options={[{ value: "host", label: "La pasa el anfitrión" }, { value: "auto", label: "Automática" }]} value={v} onChange={setV} />`

## Feedback

- **Badge**: a short status label; status tones always carry an icon or a clear word. `<Badge tone="success" icon="check">Ha respondido</Badge>`
- **Icon**: one glyph from the set (`iconNames` lists them all). `<Icon name="crown" />`
- **Avatar**: the player's initials on a colour that stays the same on every phone. `<Avatar player={{ id, name }} mark="host" />`
- **AvatarGroup**: overlapping avatars with "+N". `<AvatarGroup players={answered} max={4} />`
- **Toast**: a short floating message, rendered in `Screen`'s `overlays`. `<Toast open={open} message="Código copiado" tone="success" onClose={() => setOpen(false)} />`
- **BottomSheet**: the mobile dialog, rendered in `Screen`'s `overlays`. `<BottomSheet open={open} onClose={close} title="¿Salir de la partida?" actions={<Button variant="danger" fullWidth>Salir</Button>}>…</BottomSheet>`
- **Skeleton**: a placeholder until the first poll answers. `<Skeleton shape="circle" />`
- **Spinner**: an indeterminate wait. `<Spinner />`
- **EmptyState**: an icon, a title and some help, for empty lists and error screens. `<EmptyState icon="alert" tone="danger" title="Esa partida no existe" description="Revisa el código." />`

## App structure

- **TopBar**: the game code, the round and an optional countdown. `<TopBar gameCode="KQZT" round={3} totalRounds={10} trailing={<Countdown endsAt={r.endsAt} serverNow={s.now} duration={30} />} />`
- **BottomActionBar**: the sticky main action in the thumb zone, with an optional hint. `<BottomActionBar hint="Hacen falta al menos 3 jugadores (sois 2)"><Button size="lg" fullWidth disabled>Empezar</Button></BottomActionBar>`
- **ConnectionBanner**: shows "Reconectando…", then "Conectado" for 2 s; rendered in `Screen`'s `banner`, so it pushes the content down instead of covering it. `<ConnectionBanner status={isError ? "reconnecting" : "connected"} />`

## Game

- **GameCodeDisplay**: the big game code, with copy and share. `<GameCodeDisplay code="KQZT" shareUrl={joinUrl} />`
- **PlayerList**: everyone in the game, marked as host, you, answered (never the value), waiting or disconnected. `<PlayerList players={players} youId={me.id} showAnswerStatus />`
- **AnswerTracker**: "7 de 12 han respondido", with avatars. `<AnswerTracker players={players.map((p) => ({ ...p, answered: p.hasAnswered }))} compact />`
- **QuestionCard**: the question and its unit, or the impostor's unit-only view. `<QuestionCard question={q.text} unit={q.unit} impostor={me.isImpostor} />`
- **Countdown**: the seconds left, from `endsAt` and `serverNow` (never the phone's clock alone); a ring, or a bar for "Siguiente ronda en". `<Countdown endsAt={round.endsAt} serverNow={view.serverNow} duration={30} />`
- **EstimateRuler**: the tape-measure picker where the player chooses their estimate, with linear or log scale, negatives, decimal steps, −/+ and typed entry. The submit button is not part of it. `<EstimateRuler min={q.min} max={q.max} unit={q.unit} step={q.step} value={v} onChange={setV} sentValue={me.sent} locked={lockAfterSend && me.sent != null} disabled={timeUp} />`
- **RevealRuler**: the solution and every estimate, drawn as avatars on a zoomed ruler. `<RevealRuler min={q.min} max={q.max} unit={q.unit} solution={q.solution} estimates={answers} />`
- **RevealList**: the same reveal as text, sorted by distance, with points. `<RevealList unit={q.unit} solution={q.solution} entries={answers} youId={me.id} />`
- **ScoreDelta**: the points won this round. `<ScoreDelta points={2} reason="exact" />` shows "+2 ¡exacto!"
- **Scoreboard**: the ranking, with ties and animated moves. `<Scoreboard rows={players.map((p) => ({ id: p.id, name: p.name, score: p.total, delta: p.roundPoints, previousRank: p.prevRank }))} youId={me.id} />`
- **VoteOption**: a player tile to vote for the impostor. `<VoteOption player={p} selected={pick === p.id} voted={sent} locked={finalVotes} onSelect={() => setPick(p.id)} />`
- **VerdictCard**: who the impostor was and whether they were caught; pass `votes` to show who voted for whom. `<VerdictCard outcome="caught" impostor={imp} impostorPoints={0} votes={showVotes ? votes : undefined} />`
- **FinalPodium**: the top three on steps, everyone else below. `<FinalPodium players={players.map((p) => ({ id: p.id, name: p.name, score: p.total }))} youId={me.id} />`

## Helpers

- `formatNumber(1234567.5)` gives "1.234.567,5" · `formatWithUnit(45, "%")` gives "45 %" · `formatReadableWithUnit(1.2e6, "personas")` gives "1,2 millones de personas" · `formatPoints(3)` gives "3 puntos" · `parseEsNumber("1.500")` gives 1500
- `withDistinctNames(players)` turns repeated nicknames into "Ana", "Ana 2" (only when your games allow them)
- `createScale({ min, max, step, kind })` and `chooseScale(min, max)`: the ruler maths, if you need it elsewhere

## More detail

- [`docs/components/`](docs/components/): one page per component, with its props, states and an example.
- [`docs/estimate-ruler.md`](docs/estimate-ruler.md): the ruler's full spec, with the value-to-position formulas for both scales.
- [`docs/open-decisions.md`](docs/open-decisions.md): the product rules each group decides, and the props for every variant.
- [`docs/brand.md`](docs/brand.md): colour, type, spacing, motion, accessibility and voice. Tokens live in `design/tokens.json`; `src/styles/tokens.css` is generated from it with `pnpm --filter @hmk/ui tokens`.
