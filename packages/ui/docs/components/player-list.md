# PlayerList

Everyone in the game with host, you, answered (never the value), waiting and disconnected.

## Props

```ts
export interface PlayerListProps {
  players: PlayerListItem[];
  /** Id of the player using this phone: gets a "Tú" badge and goes first. */
  youId?: string;
  /** Show the answered / waiting column (round screens). In the lobby leave it off. */
  showAnswerStatus?: boolean;
  /** Text when the list is empty. */
  emptyText?: string;
}
```

## States

lobby · round (answer status) · disconnected · empty · repeated names (via withDistinctNames)

## Guidelines

- You go first and are highlighted.
- Disconnected rows dim and say so in words.

## Example

```tsx
<PlayerList
  players={players.map((p) => ({
    id: p.id,
    name: p.name,
    host: p.isHost,
    status: p.answered ? "answered" : "waiting",
  }))}
  youId={me.id}
  showAnswerStatus
/>
```
