import type { Meta, StoryObj } from "@storybook/react-vite";

import { Icon, iconNames } from "../components/icon.tsx";
import { Phone } from "./helpers.tsx";

const meta: Meta<typeof Icon> = {
  title: "Foundations/Icons",
  component: Icon,
  decorators: [
    (Story) => (
      <Phone>
        <Story />
      </Phone>
    ),
  ],
};
export default meta;
type S = StoryObj<typeof Icon>;

export const AllIcons: S = {
  render: () => (
    <div className="grid grid-cols-4 gap-3">
      {iconNames.map((n) => (
        <div
          key={n}
          className="bg-surface-raised text-ink flex flex-col items-center gap-1 rounded-md p-2"
        >
          <Icon name={n} size={24} />
          <span className="text-ink-muted text-[11px]">{n}</span>
        </div>
      ))}
    </div>
  ),
};
