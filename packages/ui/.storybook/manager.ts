import type { TagBadgeParameters } from "storybook-addon-tag-badges/manager-helpers";
import { addons } from "storybook/manager-api";

/**
 * One badge per group whose data a Patterns/ screen shows. Only these four tags get a
 * badge in the sidebar and the toolbar (the addon's default display): the default config is left out on purpose, so built-in tags (dev, test,
 * autodocs, play-fn...) never show one.
 */
const group = (
  tag: string,
  style: "blue" | "green" | "orange" | "purple"
): TagBadgeParameters[number] => ({
  tags: tag,
  badge: {
    text: tag,
    style,
    tooltip: `Esta pantalla muestra datos del servicio ${tag}`,
  },
});

addons.setConfig({
  tagBadges: [
    group("games", "blue"),
    group("rounds", "green"),
    group("scoring", "orange"),
    group("impostor", "purple"),
  ] satisfies TagBadgeParameters,
});
