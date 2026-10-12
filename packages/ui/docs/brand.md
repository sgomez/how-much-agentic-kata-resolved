# Brand and foundations

A ojo is a party game for a room of phones: everyone estimates a number at the same time, then the answers drop onto a ruler. "A ojo" is Spanish for "by eye, roughly". It is the name of the game and appears in the page title and the share sheet. The look is a tape measure turned into a sticker sheet: warm paper, tape-measure yellow, ink-black outlines, hard offset shadows that sink when pressed. Everything has to read at a glance from arm's length, in a bright classroom, by 20 people who have never seen the game.

Build screens only from the components in this system (see [`COMPONENTS.md`](../COMPONENTS.md)). Wrap every screen in `Screen`, put the one main action in `BottomActionBar`, and never write raw colours, sizes or fonts: every utility below comes from `design/tokens.json`.

## Voice and copy

Write short, informal Spanish from Spain. Use **tú** to one player and **vosotros** to the whole group ("¡Ya habéis respondido todos!"). Sentence case everywhere, no full stops on buttons, no emoji in UI text (icons do that job). Numbers are always es-ES: `1.234.567,5`, `45 %`, `12 €`, `−12 °C` (typographic minus, space before units and %).

| Situation | Write | Not |
| --- | --- | --- |
| Primary button | Enviar · Empezar · Unirme · Siguiente ronda · Jugar otra vez | ENVIAR RESPUESTA · Submit · Aceptar |
| Changed after sending | Cambiar | Reenviar estimación |
| Waiting | Esperando a que Lucía empiece la partida… | Por favor, espere |
| Empty list | Aún no hay nadie. ¡Comparte el código! | No hay datos |
| Unknown code | No hay ninguna partida con ese código | Error 404: game not found |
| Game full | La partida está llena · Ya hay 20 de 20 jugadores | Capacidad máxima alcanzada |
| Out of range typed | Como máximo 100 %. Lo hemos dejado ahí. | Valor inválido |
| Not a number | Escribe solo números, como 1.250 o 3,5. | Formato incorrecto |
| Connection | Reconectando… → Conectado | ¡Error de conexión! |
| Impostor | Eres el impostor. Disimula. | ⚠️ ¡ATENCIÓN! ERES EL IMPOSTOR |
| Disabled reason | Hacen falta al menos 3 jugadores (sois 2) | (a disabled button with no reason) |

Errors say what happened and what to do next, never blame the player, and never show codes or stack traces. A disabled primary button always has its reason in the `hint` of `BottomActionBar`.

## Colour

- **Brand, `yellow` ramp (50–900).** `color-primary` (= `yellow-400`, `#ffc61a`) is the tape: primary buttons, the ruler, selected chips and tiles, the game code. It is never text on light grounds; put `on-primary` (ink) on it at 11:1. Hover and pressed fills use `primary-strong`.
- **Accent, `pink` ramp (50–900).** `color-accent` marks the solution on the reveal, the impostor and celebrations. Text on it is `on-accent`; pink text on surfaces is `accent-text`. Use it once per screen at most.
- **Neutrals, `neutral` ramp (0–950).** Warm greys. Components use the semantic tokens, not the ramp: `surface` (page), `surface-raised` (cards, bars, inputs), `surface-sunken` (wells, read-only, skeletons), `ink` (text), `ink-muted` (secondary text), `line` (2px sticker outlines) and `line-subtle` (dividers, minor ticks).
- **Semantic.** Each of `success`, `warning`, `danger` and `info` has a fill, an `on-` colour for text on that fill, a `-soft` tint and a `-text` colour for text on surfaces and on the tint. `success` is teal rather than green: it moves off the red–green axis so it never depends on hue against `danger`. Every status also carries an icon or a word.
- **Player palette, `player-1` … `player-12`.** These are 12 colours chosen by search so that every pair stays at least 11 ΔE (CAM02-UCS) apart under simulated deuteranopia, protanopia and tritanopia, with a lightness ladder from rust to sky. A player's colour comes from `playerColorIndex(id)` (an FNV-1a hash with avalanche, mod 12), so it is the same on every phone. Initials are ink on light colours and white on dark ones (≥4.5:1 either way). With 20 players colours repeat, so an avatar always shows **initials**, and markers always come with a name or label. Colour is never the only cue.
- **Contrast.** Every text token passes WCAG AA (4.5:1) on every surface it is allowed on, in both themes (each token's usage note names its grounds). Controls, focus rings and icons pass 3:1.

**Dark mode is included and follows the phone's setting.** It is worth it here, at almost no cost: many students keep their phones in dark mode, a white screen is loud in a dim room, and because components only use semantic tokens the dark theme is just a second set of values for the same names (`[data-theme="dark"]`, or `prefers-color-scheme` when no theme is forced). The yellow tape and the player colours stay the same in both themes; text on yellow stays ink in both themes.

## Type

- **Display: Archivo** (variable, `wdth` 62–125, `wght` 100–900), for numbers and titles. Its condensed width (`wdth` 78, the `condensed` utility) fits `1.000.000.000` at 36px into a 328px column, and it has true **tabular numerals** (`tnum`), so a value that changes while you look at it never jitters. Use `condensed` for every number that changes: the estimate, the countdown, scores, codes.
- **Text: Atkinson Hyperlegible Next**, for everything else. It was designed for low-vision legibility: distinct `I l 1`, `O 0`, open shapes. Both are open-source web fonts (self-hosted via `@fontsource-variable`, so the game works on a classroom network with no Google access), with system fallbacks.
- **Scale** (Tailwind `text-*`): `estimate` 64/64 · `estimate-md` 48/52 · `estimate-sm` 36/40 · `code` 56/56 · `display` 40/44 · `title` 28/32 · `heading` 22/28 · `lg` 18/26 · `base` 16/24 · `sm` 14/20 · `xs` 12/16 bold. The estimate is the largest thing on the round screen; EstimateRuler steps it down by character count (≤7 → 64, ≤10 → 48, else 36) inside a fixed-height box, so nothing below moves. Inputs are 16px so iOS does not zoom on focus. Nothing is smaller than 12px.

## Space, shape, depth

- **Spacing** is a 4px grid (`spacing` = 4px, and `spacing-1` … `spacing-16`, the same numbers as Tailwind's `p-4` = 16px). Screen gutter `px-4`; gap between sections `gap-6`; inside cards `p-4`; between list rows `gap-2`.
- **Touch.** Every target is at least `spacing-touch` (44px) in both directions; buttons are 48px, the main action 56px, the ruler's −/+ 48px. Neighbouring targets keep at least `gap-2` (8px). Whole rows are tappable (Switch, VoteOption).
- **Radius.** `radius-sm` 6 (badges) · `radius-md` 12 (buttons, inputs, chips) · `radius-lg` 20 (cards, tiles, the tape) · `radius-xl` 28 (sheet corners) · `radius-full` (avatars, pills, switches).
- **Borders.** `border-thin` 1px for dividers in `line-subtle`; `border-thick` 2px in `line` for every control and card (the sticker outline); `border-heavy` 3px for selection (picked vote, closest estimate).
- **Elevation is a hard shadow, not a blur.** `shadow-sticker` (0 4px 0 ink) under raised controls and cards, `shadow-sticker-sm` (2px) under small ones. **Pressed = the control sinks into its shadow** (`pressable`: translateY by the shadow depth, shadow off), which is visible under a thumb in daylight. Floating layers (toasts, banner, sheet) use the soft `shadow-float` and `shadow-sheet`.

## Layout

- Design at **360×800**, check at **430×932**. `Screen` is a `100dvh` column capped at `container-app` (480px): on a tablet or laptop it becomes a centred column on a sunken backdrop with hairline sides, not a stretched phone.
- `TopBar` sits under the notch (`env(safe-area-inset-top)`), `BottomActionBar` above the home indicator (`env(safe-area-inset-bottom)`). The middle scrolls on its own; the bars never scroll away.
- **Primary actions live in the thumb zone**: the bottom bar, full width, 56px. Secondary actions go above it or as `ghost`. The ruler's −/+ sit on the right edge at mid-height, where a right thumb rests.

## Motion

Durations: `duration-instant` 80ms (press) · `duration-fast` 140ms (toggles, chips) · `duration-base` 220ms (sheets, toasts, row moves) · `duration-slow` 400ms (countdown turning urgent, score pops) · `duration-reveal` 700ms (markers dropping onto the reveal ruler, staggered 40ms). Easings: `ease-out` for arrivals, `ease-in-out` for moves, `ease-spring` (small overshoot) only for celebratory pops (`ScoreDelta`, the "Enviado" stamp), never for layout.

Motion only marks the moments that matter: the reveal, score changes, scoreboard reordering, and the countdown's last five seconds. Nothing restarts on a poll: the countdown is driven by `requestAnimationFrame` from `endsAt` and `serverNow`, entrance animations run on mount only, and `Scoreboard` animates position changes with FLIP. Under `prefers-reduced-motion` every animation and transition ends instantly. Meaning never depends on motion: urgency also changes colour, weight and the spoken count.

## Iconography

A single set of 35 original line icons, 24px grid, 2px round strokes, drawn in `currentColor` (`Icon name="…"`; full list in `iconNames` and the Foundations/Icons story). They are inline SVG in the bundle, so there is no icon font and nothing extra to load. Icons sit next to a word; an icon alone (IconButton) always has a `label`. No emoji in the UI.

## Accessibility

- **Focus** is one rule for everything: a 3px solid `color-focus` outline with a 2px offset, drawn on the surface around the control (≥5:1 on every surface, both themes). Only keyboard focus shows it (`:focus-visible`).
- **Roles and labels.** EstimateRuler is a `slider` with `aria-valuetext` that includes the unit ("1,2 millones de personas"). Stepper is a `spinbutton`, Switch a `switch`, SegmentedControl a `radiogroup`, chips and vote tiles are toggle buttons (`aria-pressed`), BottomSheet is a modal `dialog` that traps and returns focus. Every field has a visible label.
- **Live regions.** The countdown speaks at 10 s and each of the last 5 seconds; toasts, the connection banner, the bottom bar's hint, CodeInput and Input errors, and the ruler's typed-value notes are announced politely.
- **Never colour alone.** Status always has an icon or a word; players always have initials; the closest estimate has a ring plus a "Más cerca" badge; urgency changes colour, weight and the text.

## Engineering rules

- React 19, Tailwind CSS 4, TypeScript, Storybook 10. **No runtime dependencies beyond React.** The only additions are the two `@fontsource-variable` font packages (CSS and font files, no JavaScript), chosen so the fonts load offline.
- Tokens live in `design/tokens.json`; `src/styles/tokens.css` (the Tailwind `@theme` block) is generated from it by `pnpm --filter @hmk/ui tokens`, and a unit test fails when the two drift apart. Tailwind's default palette, type scale, radii and shadows are cleared, so `bg-surface`, `text-ink`, `text-estimate`, `rounded-lg`, `shadow-sticker` are the only way to say those things.
- Polling every second is safe by construction: components keep no derived state that a new identical value would reset, the ruler only moves when the incoming value differs from what it last emitted, and the countdown's offset to server time only changes when it drifts by more than 250 ms.
