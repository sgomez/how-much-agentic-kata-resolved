# EstimateRuler

The tape-measure picker: drag the vertical ruler under the fixed indicator, fine-tune with −/+, or tap the number to type it.

## Props

```ts
export interface EstimateRulerProps {
  /** Lowest selectable value (may be negative). */
  min: number;
  /** Highest selectable value. */
  max: number;
  /** Unit shown under the value and read by screen readers: "km", "personas", "°C". */
  unit: string;
  /** linear · log · auto (default: log when max / max(min, 1) > 10.000). */
  scale?: ScaleKind | "auto";
  /** Smallest change. Default 1. Decimal steps (0,5) are fine. */
  step?: number;
  /** The current estimate, or null when the player has not chosen yet. */
  value: number | null;
  /** Fires with the snapped value while dragging, on −/+, keys and exact entry. */
  onChange: (value: number) => void;
  /** The value the server has for this player. When it equals value the ruler shows "Enviado"; when it differs, "Sin enviar". */
  sentValue?: number | null;
  /** Sent and final (the "locked after Enviar" rule): read-only, with a lock. */
  locked?: boolean;
  /** The deadline passed: read-only, greyed, "Se acabó el tiempo". */
  disabled?: boolean;
  /** Accessible name of the slider. Default "Tu estimación". */
  label?: string;
}
```

## States

empty · dragging · set · submitted (editable) · changed after sending · submitted (locked) · disabled

## Guidelines

- The full spec, with formulas, is in [`../estimate-ruler.md`](../estimate-ruler.md).
- Values grow upward; dragging is direct manipulation with velocity-dependent precision, inertia and rubber-band ends.
- scale="auto" picks log when max / max(min, 1) > 10.000.
- The submit button is not part of it: put Enviar/Cambiar in BottomActionBar.

## Example

```tsx
<EstimateRuler
  min={q.min}
  max={q.max}
  unit={q.unit}
  step={q.step}
  value={value}
  onChange={setValue}
  sentValue={me.sent}
  locked={lockAfterSend && me.sent != null}
  disabled={timeUp}
/>
```
