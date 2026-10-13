import type { ReactNode } from "react";

/**
 * What every screen of another group receives: the game code and the slots of
 * `Screen` the page fills (bottom action, connection banner, overlays).
 */
export interface SceneScreenProps {
  code: string;
  bottom?: ReactNode;
  banner?: ReactNode;
  overlays?: ReactNode;
}
