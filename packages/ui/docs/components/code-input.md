# CodeInput

Big character boxes for the game code; uppercases, filters, accepts paste and advances on its own.

## Props

```ts
export interface CodeInputProps {
  /** Visible label. Default "Código de la partida". */
  label?: string;
  value: string;
  onChange: (value: string) => void;
  /** Called once when the last character is typed or a full code is pasted. */
  onComplete?: (value: string) => void;
  /** Number of characters. Default 4. */
  length?: number;
  /** Which characters are accepted. Others are dropped as you type or paste. Default letters. */
  alphabet?: CodeAlphabet;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}
```

## States

empty · partial (caret box) · complete · error · disabled · 4–6+ characters · letters, digits or both

## Guidelines

- One real input under the boxes: paste, autofill, mobile keyboards and screen readers just work.
- length and alphabet are props because each group picks its code format.
- Accents are stripped and lowercase is uppercased; characters outside the alphabet are dropped.
- onComplete fires once when the last character arrives (also on paste).

## Example

```tsx
<CodeInput
  value={code}
  onChange={setCode}
  length={4}
  alphabet="letters"
  onComplete={join}
  error={err}
/>
```
