import type { Meta, StoryObj } from "@storybook/react-vite";

import { PLAYERS, player } from "../stories/fixtures.ts";
import { Phone } from "../stories/helpers.tsx";
import { Avatar, AvatarGroup } from "./avatar.tsx";

const meta: Meta<typeof Avatar> = {
  title: "Primitives/Avatar",
  component: Avatar,
  decorators: [
    (Story) => (
      <Phone>
        <Story />
      </Phone>
    ),
  ],
};
export default meta;
type S = StoryObj<typeof Avatar>;

export const Sizes: S = {
  render: () => (
    <div className="flex items-end gap-3">
      <Avatar player={player(0)} size="sm" />
      <Avatar player={player(0)} size="md" />
      <Avatar player={player(0)} size="lg" />
      <Avatar player={player(0)} size="xl" />
    </div>
  ),
};
export const Marks: S = {
  render: () => (
    <div className="flex gap-4">
      <Avatar player={player(0)} mark="host" labelled />
      <Avatar player={player(1)} mark="answered" labelled />
      <Avatar player={player(2)} mark="offline" dimmed labelled />
    </div>
  ),
};
/** The 12 player colours. With 20 players colours repeat; the initials and names always tell people apart. */
export const PlayerPalette: S = {
  render: () => (
    <div className="grid grid-cols-5 gap-3">
      {PLAYERS.map((p) => (
        <div
          key={p.id}
          className="text-ink-muted flex flex-col items-center gap-1 text-xs"
        >
          <Avatar player={p} size="lg" />
          {p.name}
        </div>
      ))}
    </div>
  ),
};
export const Group: S = {
  render: () => (
    <div className="flex flex-col gap-3">
      <AvatarGroup players={PLAYERS.slice(0, 3)} />
      <AvatarGroup players={PLAYERS} max={6} size="md" />
    </div>
  ),
};
