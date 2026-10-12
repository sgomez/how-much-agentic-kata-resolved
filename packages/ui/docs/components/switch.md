# Switch

An on/off setting whose whole row is the touch target.

## Props

```ts
export interface SwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** One line explaining what it does ("Un jugador no verá la pregunta"). */
  description?: string;
  disabled?: boolean;
}
```

## States

off · on · focus · disabled

## Example

```tsx
<Switch
  label="Modo impostor"
  description="Cada ronda, alguien no verá la pregunta"
  checked={on}
  onChange={setOn}
/>
```
