# Input

A labelled single-line text field with hint, counter and error.

## Props

```ts
export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value" | "size"
> {
  /** Visible label above the field. Required: every field is labelled. */
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Help under the field ("Así te verán los demás"). Replaced by error when there is one. */
  hint?: string;
  /** Error message; turns the field red and is announced. */
  error?: string;
}
```

## States

empty · filled · focus · error (announced) · disabled

## Guidelines

- 16px text, so iOS does not zoom.
- The error replaces the hint and is announced (role alert).

## Example

```tsx
<Input
  label="Tu apodo"
  value={name}
  onChange={setName}
  hint="Así te verán los demás"
  maxLength={16}
/>
```
