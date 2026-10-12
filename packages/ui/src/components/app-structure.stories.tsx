import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";

import { deadline, GAME_CODE } from "../stories/fixtures.ts";
import { BottomActionBar } from "./bottom-action-bar.tsx";
import { Button } from "./button.tsx";
import { ConnectionBanner } from "./connection-banner.tsx";
import { Countdown } from "./countdown.tsx";
import { Screen } from "./screen.tsx";
import { TopBar } from "./top-bar.tsx";
import { Text } from "./typography.tsx";

const meta: Meta = { title: "App structure/Screen and bars" };
export default meta;
type S = StoryObj;

const frame = (h = 600) => ({ ["--screen-h" as string]: `${h}px` });
const d = deadline(24);

export const ScreenWithBars: S = {
  render: () => (
    <div style={frame()}>
      <Screen
        top={
          <TopBar
            gameCode={GAME_CODE}
            round={3}
            totalRounds={10}
            trailing={<Countdown {...d} duration={30} />}
          />
        }
        bottom={
          <BottomActionBar hint="Puedes cambiarla hasta que acabe el tiempo">
            <Button size="lg" fullWidth icon="send">
              Enviar
            </Button>
          </BottomActionBar>
        }
      >
        <Text>El contenido va aquí y hace scroll entre las dos barras.</Text>
      </Screen>
    </div>
  ),
};
export const TopBarOnlyCode: S = {
  render: () => <TopBar gameCode={GAME_CODE} />,
};
export const BottomBarDisabledWithHint: S = {
  render: () => (
    <div className="pt-40">
      <BottomActionBar hint="Hacen falta al menos 3 jugadores (sois 2)">
        <Button size="lg" fullWidth disabled icon="play">
          Empezar
        </Button>
      </BottomActionBar>
    </div>
  ),
};
export const BannerReconnecting: S = {
  render: () => (
    <div style={frame(200)}>
      <Screen banner={<ConnectionBanner status="reconnecting" />}>
        <span />
      </Screen>
    </div>
  ),
};
const Flapping = () => {
  const [s, setS] = useState<"connected" | "reconnecting">("reconnecting");
  useEffect(() => {
    const t = window.setInterval(
      () => setS((x) => (x === "connected" ? "reconnecting" : "connected")),
      3500
    );
    return () => window.clearInterval(t);
  }, []);
  return (
    <div style={frame(200)}>
      <Screen banner={<ConnectionBanner status={s} />}>
        <Text tone="muted">
          Alterna cada 3,5 s: «Reconectando…» y luego «Conectado» durante 2 s.
        </Text>
      </Screen>
    </div>
  );
};
export const BannerRecovers: S = { render: () => <Flapping /> };
