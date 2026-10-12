import type { Meta, StoryObj } from "@storybook/react-vite";

import { HOST, PLAYERS, player, YOU } from "../stories/fixtures.ts";
import { Frames, PhoneFrame } from "../stories/helpers.tsx";
import {
  LobbyScreen,
  NicknameScreen,
  ErrorScreen,
  duplicatePlayers,
} from "./screens.tsx";

const meta: Meta = { title: "Patterns/03 Lobby", tags: ["games"] };
export default meta;
type S = StoryObj;

export const HostAndPlayer: S = {
  render: () => (
    <Frames>
      <PhoneFrame label="Anfitrión" note="Ajustes editables y «Empezar»">
        <LobbyScreen viewer="host" />
      </PhoneFrame>
      <PhoneFrame
        label="Jugador"
        note="Ajustes de solo lectura; espera al anfitrión"
      >
        <LobbyScreen viewer="player" />
      </PhoneFrame>
      <PhoneFrame label="Recién creada" note="Solo el anfitrión">
        <LobbyScreen viewer="host" players={[HOST]} />
      </PhoneFrame>
    </Frames>
  ),
};
/** Open decision: minimum number of players to start. */
export const MinimumPlayers: S = {
  render: () => (
    <Frames>
      <PhoneFrame
        label="Decisión · mínimo de jugadores"
        note="A: sin mínimo — «Empezar» siempre activo"
      >
        <LobbyScreen viewer="host" players={PLAYERS.slice(0, 2)} />
      </PhoneFrame>
      <PhoneFrame
        label="Decisión · mínimo de jugadores"
        note="B: mínimo 3 — desactivado y explicado"
      >
        <LobbyScreen
          viewer="host"
          players={PLAYERS.slice(0, 2)}
          minPlayers={3}
        />
      </PhoneFrame>
    </Frames>
  ),
};
/** Open decision: can a nickname repeat inside a game? */
export const RepeatedNicknames: S = {
  render: () => (
    <Frames>
      <PhoneFrame
        label="Decisión · apodos repetidos"
        note="A: permitidos — withDistinctNames() numera «Ana 2»; el color sale del id"
      >
        <LobbyScreen
          viewer="player"
          players={duplicatePlayers}
          hostId="p-ana1"
          youId="p-ana2"
        />
      </PhoneFrame>
      <PhoneFrame
        label="Decisión · apodos repetidos"
        note="B: rechazados al unirse"
      >
        <ErrorScreen kind="duplicate" />
      </PhoneFrame>
    </Frames>
  ),
};
/** Open decision: game capacity. */
export const GameCapacity: S = {
  render: () => (
    <Frames>
      <PhoneFrame
        label="Decisión · capacidad"
        note="A: sin límite — solo el contador"
      >
        <LobbyScreen viewer="host" players={PLAYERS.slice(0, 14)} />
      </PhoneFrame>
      <PhoneFrame
        label="Decisión · capacidad"
        note="B: con límite — el contador muestra el máximo"
      >
        <LobbyScreen
          viewer="host"
          players={PLAYERS.slice(0, 20)}
          capacity={20}
        />
      </PhoneFrame>
      <PhoneFrame
        label="Decisión · capacidad"
        note="B: quien llega a una partida llena"
      >
        <ErrorScreen kind="full" />
      </PhoneFrame>
    </Frames>
  ),
};
/** Open decision: the host leaves. */
export const HostLeaves: S = {
  render: () => (
    <Frames>
      <PhoneFrame
        label="Decisión · el anfitrión se va"
        note="A: la partida se cierra para todos"
      >
        <ErrorScreen kind="closed" />
      </PhoneFrame>
      <PhoneFrame
        label="Decisión · el anfitrión se va"
        note="B: otro pasa a ser anfitrión, con aviso"
      >
        <LobbyScreen
          viewer="host"
          players={PLAYERS.slice(1, 6)}
          hostId={YOU.id}
          youId={YOU.id}
          toast={`${HOST.name} se ha ido. Ahora el anfitrión eres tú`}
        />
      </PhoneFrame>
      <PhoneFrame
        label="Decisión · el anfitrión se va"
        note="B: lo que ven los demás"
      >
        <LobbyScreen
          viewer="player"
          players={PLAYERS.slice(1, 6)}
          hostId={YOU.id}
          youId={player(2).id}
          toast={`${HOST.name} se ha ido. Ahora el anfitrión es ${YOU.name}`}
        />
      </PhoneFrame>
    </Frames>
  ),
};
export const NicknameAfterJoin: S = {
  tags: ["!games"],
  render: () => (
    <Frames>
      <PhoneFrame
        label="Unirse con enlace"
        note="Si llegas por enlace sin apodo, primero el apodo"
      >
        <NicknameScreen />
      </PhoneFrame>
    </Frames>
  ),
};
