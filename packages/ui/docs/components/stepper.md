# Stepper

A small number set with − and + (rounds, seconds per round).

## Props

```ts
export interface StepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Default 1. */
  step?: number;
  /** Unit after the number: "s", "rondas". */
  unit?: string;
  /** Help line under the label. */
  hint?: string;
  disabled?: boolean;
}
```

## States

default · at min/max (that button disabled) · disabled · focus

## Guidelines

- Keyboard: arrows, Home, End on the value (role spinbutton).

## Example

```tsx
<Stepper
  label="Segundos por ronda"
  value={secs}
  onChange={setSecs}
  min={10}
  max={90}
  step={5}
  unit="s"
/>
```
