import type { TagBadgeParameters } from "storybook-addon-tag-badges/manager-helpers";
import { addons } from "storybook/manager-api";

/**
 * One badge per group whose data a Patterns/ screen shows, in the toolbar only: the addon
 * shows a single badge per sidebar entry, so the sidebar would name one group and hide the
 * rest. The sidebar tag filter still finds every screen of a group. The default config is
 * left out on purpose, so built-in tags (dev, test, autodocs, play-fn...) never show one.
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
  display: { sidebar: [], toolbar: true },
});

addons.setConfig({
  tagBadges: [
    group("games", "blue"),
    group("rounds", "green"),
    group("scoring", "orange"),
    group("impostor", "purple"),
  ] satisfies TagBadgeParameters,
});
