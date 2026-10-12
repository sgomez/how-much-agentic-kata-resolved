# ChipGroup

Wrapping toggle chips for picking several options (question packs).

## Props

```ts
export interface ChipGroupProps {
  /** Visible group label ("Paquetes de preguntas"). */
  label: string;
  options: ChipOption[];
  /** Selected values. ChipGroup is always multi-select; for one-of-many use SegmentedControl. */
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}
```

## States

unselected · selected (yellow + check) · pressed · focus · disabled

## Guidelines

- Always multi-select. For exactly one of a few, use SegmentedControl.

## Example

```tsx
<ChipGroup
  label="Paquetes de preguntas"
  options={[{ value: "geo", label: "Geografía" }]}
  value={packs}
  onChange={setPacks}
/>
```
