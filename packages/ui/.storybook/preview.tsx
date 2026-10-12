import type { Preview } from "@storybook/react-vite";

import "../src/styles/index.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Colour theme",
      toolbar: {
        title: "Tema",
        icon: "mirror",
        items: [
          { value: "light", title: "Claro" },
          { value: "dark", title: "Oscuro" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story, ctx) => {
      document.documentElement.dataset.theme = ctx.globals.theme ?? "light";
      return <Story />;
    },
  ],
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },
    options: {
      storySort: {
        order: [
          "Foundations",
          "Primitives",
          "App structure",
          "Game",
          "Patterns",
        ],
      },
    },
  },
};
export default preview;
