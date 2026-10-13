import type { ReactNode } from "react";

/**
 * What every screen of another group receives from the scene director: the
 * game code, the round the game is on, and the slots of `Screen` the page fills
 * (bottom action, connection banner, overlays). Screens never read the current
 * round from the polled game view and never navigate: the director picks them.
 */
export interface SceneScreenProps {
  code: string;
  round: number;
  bottom?: ReactNode;
  banner?: ReactNode;
  overlays?: ReactNode;
}
