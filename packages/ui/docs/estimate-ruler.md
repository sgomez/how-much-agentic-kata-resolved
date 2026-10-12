# EstimateRuler, the spec

The ruler is how a player picks their estimate, and it is the core of the game. It replaces a rotary dial, which needed circular gestures, hid the value under the hand and gave poor precision. It works like a tape measure: a vertical yellow tape slides up and down under a fixed indicator, and the big number above it is whatever sits under the indicator.

```tsx
<EstimateRuler
  min={q.min}
  max={q.max}
  unit={q.unit}
  scale={q.scale}
  step={q.step}
  value={value}
  onChange={setValue}
  sentValue={me.sentEstimate}
  locked={rules.lockAfterSend && me.sentEstimate != null}
  disabled={timeIsUp}
/>
```

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `min`, `max` | `number` | required | Selectable range. Negative values are fine. |
| `unit` | `string` | required | Shown under the value and read aloud. Long units wrap to two lines, then truncate. |
| `scale` | `'linear' \| 'log' \| 'auto'` | `'auto'` | See the auto rule below. |
| `step` | `number` | `1` | Smallest change. Decimals such as `0.5` are fine. |
| `value` | `number \| null` | required | `null` means no estimate yet. |
| `onChange` | `(v: number) => void` | required | Snapped values only, while dragging and on −/+, keys and typing. |
| `sentValue` | `number \| null` | — | What the server has. Equal to `value` shows "Enviado"; different shows "Sin enviar · antes X". |
| `locked` | `boolean` | `false` | Sent and final (the "locked after Enviar" rule). Read-only, with a lock. |
| `disabled` | `boolean` | `false` | The deadline passed. Read-only and greyed, with "Se acabó el tiempo". |
| `label` | `string` | `'Tu estimación'` | Accessible name. |

The submit button is not part of the ruler: it lives in `BottomActionBar`, so each group decides when it says "Enviar", "Cambiar" or "Enviado".

## Value ↔ position

Everything maps through a normalised coordinate `t ∈ [0, 1]` (0 = `min`, 1 = `max`). The tape is `L` pixels long and the indicator sits at `y = t · L`. Values grow **upward**, and dragging is direct manipulation: the tape follows the finger.

**Linear**

```
t(v) = (v − min) / (max − min)
v(t) = min + t · (max − min)
```

**Log**, with an offset so that `min ≤ 0` still works:

```
o    = min ≥ 1 ? 0 : 1 − min          // shift the range so v + o ≥ 1
a    = log10(min + o)
b    = log10(max + o)
t(v) = (log10(v + o) − a) / (b − a)
v(t) = 10^(a + t · (b − a)) − o
```

For 1–1.000.000.000 the offset is 0, which is a pure log scale. For 0–1.000.000 it is 1, so 0 sits at the bottom and 1, 10 and 100 are reachable. For −90–60 °C it is 91: the range is defined and drags work, but the auto rule never picks log for that range.

**Ruler length `L`**

- Linear: `minor = max(niceCeil(step), niceCeil(range / 200))`, with 12 px per minor tick, and `L = max(600, range / minor · 12)`. That gives 0–100 % → 1.200 px (1 % per tick), 0–8.848 m → 2.124 px (a tick every 50 m), and −90–60 °C → 1.800 px.
- Log: 240 px per decade, `L = max(600, (b − a) · 240)`. 1–10⁹ → 2.160 px.

`niceCeil(x)` is the smallest of 1, 2 or 5 × 10ⁿ that is ≥ x.

**Snapping**

- Linear: `snap(v) = clamp(min + round((v − min) / step) · step)`, rounded to the decimals of `step`.
- Log: two significant digits, never finer than `step`: `stepAt(v) = max(step, 10^(floor(log10|v|) − 1))`. A drag lands on 12, 120, 1.200, 12.000.000 and never on 12.345.678. Typing keeps the exact value, snapped to `step` only.

**Auto rule.** Use `log` when `max / max(min, 1) > 10.000`, else `linear`. The brief suggests `> 1.000`, but with that rule 0–8.848 m becomes log, where 8.000 and 8.800 sit 9 px apart. A threshold of four orders of magnitude keeps everyday ranges linear and precise:

| Range                    | Ratio  | Scale  |
| ------------------------ | ------ | ------ |
| 0–100 %                  | 100    | linear |
| 0–8.848 m                | 8.848  | linear |
| −90–60 °C                | 60     | linear |
| 0–50.000 km              | 50.000 | log    |
| 1–1.000.000.000 personas | 10⁹    | log    |

When a question knows better, it sets `scale` explicitly.

## Ticks and labels

- Linear: a minor tick every `m` (at least 10 px apart). Major ticks fall every `10m`, or every `5m` when `m` starts with a 2, so majors land on 1, 2 or 5 × 10ⁿ. A mid tick sits halfway between majors. Majors are labelled in `text-lg`, mids in `text-sm`. Labels use the full form below 10.000 ("4.500") and the compact form above ("25 k", "1 M").
- Log: a major tick at every decade (1, 10, 100…), mid ticks at 2 and 5, minor ticks at 3, 4, 6, 7, 8 and 9 when a decade is at least 160 px tall. Labels are compact ("1 k", "20 k", "1 M", "1.000 M"). When decades get dense (the reveal), mids are dropped first, then every other decade label.
- Only ticks within ±1 screen of the indicator are rendered. The tick layer moves with a GPU transform, and React re-renders it only when the tape travels half a screen.
- Beyond `min` and `max`, the tape is hatched, so the end of the scale is obvious.

## Interaction

- **Drag** (pointer events, `touch-action: none` on the tape only, so the page still scrolls elsewhere). The gain depends on velocity, so precision follows the hand:

  | Finger speed | Gain     | Feel                         |
  | ------------ | -------- | ---------------------------- |
  | < 0,08 px/ms | 0,35×    | slow and precise: fine ticks |
  | < 0,5 px/ms  | 1×       | direct                       |
  | faster       | up to 4× | flicks travel far            |

- **Inertia.** On release with velocity `v` (ruler px/ms), the projected stop is `y + v · 325 ms`. It is snapped to the nearest selectable value first, then the tape glides there with `y(t) = target + (y₀ − target) · e^(−t/325)`. That is iOS-like deceleration that always lands exactly on a step. Values are emitted as they pass under the indicator.
- **Rubber band.** Past `min` or `max`, the drag gain drops to 0,4× and the tape shows `L + d·H·0,55 / (H + 0,55·d)` (the UIScrollView formula). On release it springs back to the limit.
- **Haptics** (optional): `navigator.vibrate(6)` when crossing a decade (log) or a tenth of the range (linear), where the browser supports it. Nothing depends on it.
- **Fine adjustment.** The − and + buttons sit on the right edge at mid-height, + above the indicator and − below. A tap moves one `stepAt(value)`. Holding repeats after 400 ms every 150 ms, speeding up ×0,85 per repeat down to 40 ms, and after 12 repeats each repeat moves 10 steps.
- **Exact entry.** Tap the big number to turn it into a field with `inputmode="decimal"`, prefilled with the current value. Enter or blur commits, Escape cancels. The parser accepts "1.234.567,5", "1,5", "1.500" (thousands), "1.5" (a decimal when it cannot be thousands) and "−12". Out-of-range values are clamped with a gentle note in the status row ("Como máximo 100 %. Lo hemos dejado ahí."). Text that is not a number gets "Escribe solo números, como 1.250 o 3,5." The tape then glides to the value.
- **Keyboard and assistive tech.** The tape is `role="slider"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow` and `aria-valuetext`, for example "1,2 millones de personas" or "-12 °C". Up and Right arrows move one step up; Down and Left one step down. Page Up and Page Down jump to the next major tick. Home and End go to `min` and `max`. The −/+ buttons are outside the slider element (a slider has no interactive children) and are skipped by Tab, since the arrows do the same job.
- **External updates.** A new `value` from the parent (a poll, a reset) glides the tape there in 90 ms, unless the finger is on the tape. A value equal to the last one emitted does nothing, so a poll every second causes no flicker and restarts nothing.

## Value display

- The big line shows the **full form**, always: `1.200.000.000`. It is the exact number that gets scored and compared with the solution. It is `condensed`, tabular, and steps down by length (≤7 characters → `estimate` 64 px, ≤10 → `estimate-md` 48 px, else `estimate-sm` 36 px) inside a fixed 64 px box.
- The second line shows the **readable form with the unit** once `|v| ≥ 1.000.000` ("≈ 1,2 millones de personas", "≈ 3,4 mil millones de personas"). Below that it shows just the unit. Both fit at 360 px. The full form carries the precision and the readable form the meaning, and the readable line doubles as the unit line, so it costs no extra height.
- Units wrap to at most two lines ("habitantes por km²") and then truncate. The line has a fixed minimum height, so a long unit never pushes the tape.
- Nothing shifts while the value changes: the number box, the unit line and the status row all have fixed heights.

## States

| State | How it looks | Props |
| --- | --- | --- |
| **empty** | The number reads "¿?" in muted ink, with "Arrastra la regla o toca el número". The tape rests at the **middle of the scale in t-space** (the geometric middle on log scales): the point from which both ends are equally reachable, and the same for every player, so any anchoring is equal for all. The first touch, key press or typed value selects. | `value={null}` |
| **dragging** | The indicator thickens from 3 to 5 px and the number updates live. | (internal) |
| **set** | The number in ink. | `value={n}` |
| **submitted, editable** | A solid "Enviado ✓" stamp. Moving the tape again turns it into "Sin enviar · antes 8.000", and the bar's button becomes "Cambiar". | `sentValue={n}` |
| **submitted, locked** | "Enviado" with a lock. The tape turns grey and −/+ disappear. | `sentValue={n} locked` |
| **disabled** | Grey tape, "Se acabó el tiempo", −/+ disabled. | `disabled` |
| **reveal** | A separate component: `RevealRuler`. | — |

## Why a separate `RevealRuler`

The reveal has different inputs (a solution and N estimates), no interaction, and a different geometry: it zooms to where the answers fell, while the picker shows a fixed window around one value. Folding it into `EstimateRuler` would double that component's props and make every one of them conditional. The two share the scale engine (`createScale`), so ticks, labels and mapping are identical.

`RevealRuler` draws:

- the tape zoomed to the solution and all answers, with 12 % padding;
- the solution as a pink line with a flag, and its value in large type above the chart;
- each estimate as the player's avatar at its exact height, joined to the tape by a leader line;
- the closest estimate (ties included) with a heavy ring and a target badge.

Overlapping markers step sideways into columns 30 px apart, like a one-dimensional beeswarm, so values never move off their true height. When the lane is full, the rest collapse into a "+N" chip. Excluded estimates (an impostor who does not compete) are dashed and never count as closest. Players with no answer are listed under the chart as "Sin respuesta". `RevealList` gives the same information as text, sorted by distance, with the signed difference and the points.
