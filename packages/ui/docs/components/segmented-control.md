# SegmentedControl

Pick exactly one of 2–4 short options; arrow keys move the selection.

## Props

```ts
export interface SegmentedControlProps<T extends string> {
  /** Accessible and visible label. */
  label: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}
```

## States

selected · unselected · focus · disabled

## Example

```tsx
<SegmentedControl
  label="Siguiente ronda"
  options={[
    { value: "host", label: "La pasa el anfitrión" },
    { value: "auto", label: "Automática" },
  ]}
  value={mode}
  onChange={setMode}
/>
```
