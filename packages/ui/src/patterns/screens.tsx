/**
 * Example compositions: each screen of the game built ONLY from system components, with fake data.
 * They are references for the workshop, not the product: every open product decision is a prop here,
 * so the stories in this folder can show all variants side by side.
 */
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import {
  AnswerTracker,
  Avatar,
  Badge,
  BottomActionBar,
  Button,
  ChipGroup,
  CodeInput,
  ConnectionBanner,
  Countdown,
  DetailList,
  EmptyState,
  EstimateRuler,
  FinalPodium,
  Grid,
  Heading,
  Input,
  PlayerList,
  QuestionCard,
  RevealList,
  RevealRuler,
  GameCodeDisplay,
  Scoreboard,
  ScoreDelta,
  Screen,
  SegmentedControl,
  Stack,
  Stepper,
  Switch,
  Text,
  Toast,
  TopBar,
  VerdictCard,
  VoteOption,
  closestIds,
  withDistinctNames,
} from "../index.ts";
import type {
  PlayerListItem,
  RevealEstimate,
  ScoreRow,
  VoteRecord,
} from "../index.ts";
import {
  HOST,
  PLAYERS,
  QUESTIONS,
  GAME_CODE,
  YOU,
  byId,
  deadline,
  withScores,
} from "../stories/fixtures.ts";

type Role = "host" | "player";
const others = PLAYERS.slice(0, 8);

/* 1 ─ Nickname ────────────────────────────────────────────────────────────────────────────── */
export const NicknameScreen = ({
  initial = "",
  error,
  loading,
}: {
  initial?: string;
  error?: string;
  loading?: boolean;
}) => {
  const [name, setName] = useState(initial);
  return (
    <Screen
      centered
      bottom={
        <BottomActionBar>
          <Button
            size="lg"
            fullWidth
            icon="arrow-right"
            disabled={!name.trim()}
            loading={loading}
          >
            Seguir
          </Button>
        </BottomActionBar>
      }
    >
      <Stack gap={6}>
        <Stack gap={2}>
          <Heading level={1} size="display">
            ¿Cómo te llamamos?
          </Heading>
          <Text tone="muted">Sin registros: con un apodo basta.</Text>
        </Stack>
        <Input
          label="Tu apodo"
          value={name}
          onChange={setName}
          hint="Así te verán los demás"
          maxLength={16}
          error={error}
          placeholder="p. ej. Lucía"
          autoComplete="nickname"
        />
      </Stack>
    </Screen>
  );
};

/* 2 ─ Home ────────────────────────────────────────────────────────────────────────────────── */
export const HomeScreen = ({
  code: initial = "",
  codeLength = 4,
  alphabet = "letters" as const,
  error,
  joining,
  creating,
}: {
  code?: string;
  codeLength?: number;
  alphabet?: "letters" | "digits" | "alphanumeric";
  error?: string;
  joining?: boolean;
  creating?: boolean;
}) => {
  const [code, setCode] = useState(initial);
  return (
    <Screen
      top={<TopBar trailing={<Badge icon="user">{YOU.name}</Badge>} />}
      bottom={
        <BottomActionBar>
          <Button size="lg" fullWidth icon="play" loading={creating}>
            Crear partida
          </Button>
        </BottomActionBar>
      }
    >
      <Stack gap={6}>
        <Stack gap={2}>
          <Heading level={1} size="display">
            ¡Hola, {YOU.name}!
          </Heading>
          <Text tone="muted">
            Únete a una partida con su código o crea la tuya.
          </Text>
        </Stack>
        <Stack
          gap={4}
          className="border-line bg-surface-raised shadow-sticker rounded-lg border-2 p-4"
        >
          <CodeInput
            value={code}
            onChange={setCode}
            length={codeLength}
            alphabet={alphabet}
            error={error}
          />
          <Button
            variant="secondary"
            fullWidth
            icon="arrow-right"
            disabled={code.length < codeLength}
            loading={joining}
          >
            Unirme
          </Button>
        </Stack>
      </Stack>
    </Screen>
  );
};

const roundHint = ({
  endsEarlyNote,
  editable,
  changed,
}: {
  endsEarlyNote?: boolean;
  editable: boolean;
  changed: boolean;
}) => {
  if (endsEarlyNote) {
    return "La ronda acaba en cuanto respondáis todos";
  }
  if (!editable) {
    return;
  }
  return changed
    ? "Has movido la regla: pulsa Cambiar para enviarla"
    : "Puedes cambiarla hasta que acabe el tiempo";
};

const votingHint = (
  voted: boolean | undefined,
  locked: boolean | undefined
) => {
  if (!voted) {
    return;
  }
  return locked
    ? "Voto enviado. Esperando al resto…"
    : "Voto enviado. Puedes cambiarlo hasta que se cierre la votación";
};

const selfNote = (self: boolean, selfVote: string | undefined) => {
  if (!self) {
    return;
  }
  return selfVote === "forbidden" ? "Eres tú · no puedes" : "Eres tú";
};

/* 3 ─ Lobby ───────────────────────────────────────────────────────────────────────────────── */
export const LobbyScreen = ({
  viewer,
  players = others.slice(0, 6),
  minPlayers,
  youId,
  hostId = HOST.id,
  code = GAME_CODE,
  toast,
  capacity,
}: {
  viewer: Role;
  players?: { id: string; name: string }[];
  minPlayers?: number;
  youId?: string;
  hostId?: string;
  code?: string;
  toast?: string;
  capacity?: number;
}) => {
  const defaultYouId = viewer === "host" ? HOST.id : YOU.id;
  const you = youId ?? defaultYouId;
  const [rounds, setRounds] = useState(10);
  const [secs, setSecs] = useState(30);
  const [impostor, setImpostor] = useState(true);
  const [packs, setPacks] = useState(["geo", "ciencia", "friki"]);
  const [next, setNext] = useState<"host" | "auto">("host");
  const list: PlayerListItem[] = players.map((p) => ({
    ...p,
    host: p.id === hostId,
  }));
  const short = minPlayers !== undefined && players.length < minPlayers;
  const hostName = players.find((p) => p.id === hostId)?.name ?? "el anfitrión";
  return (
    <Screen
      top={
        <TopBar
          gameCode={code}
          trailing={
            <Badge icon="users">
              {players.length}
              {capacity ? ` / ${capacity}` : ""}
            </Badge>
          }
        />
      }
      overlays={toast ? <Toast open message={toast} duration={0} /> : null}
      bottom={
        viewer === "host" ? (
          <BottomActionBar
            hint={
              short
                ? `Hacen falta al menos ${minPlayers} jugadores (sois ${players.length})`
                : undefined
            }
          >
            <Button size="lg" fullWidth icon="play" disabled={short}>
              Empezar
            </Button>
          </BottomActionBar>
        ) : (
          <BottomActionBar
            hint={`Esperando a que ${hostName} empiece la partida…`}
          >
            <Button size="lg" fullWidth variant="ghost" icon="log-out">
              Salir de la partida
            </Button>
          </BottomActionBar>
        )
      }
    >
      <Stack gap={6}>
        <GameCodeDisplay code={code} />
        <Stack gap={3}>
          <Heading level={2}>Jugadores</Heading>
          <PlayerList players={list} youId={you} />
        </Stack>
        <Stack gap={4}>
          <Heading level={2}>Ajustes</Heading>
          {viewer === "host" ? (
            <>
              <Stepper
                label="Rondas"
                value={rounds}
                onChange={setRounds}
                min={1}
                max={20}
              />
              <Stepper
                label="Segundos por ronda"
                value={secs}
                onChange={setSecs}
                min={10}
                max={90}
                step={5}
                unit="s"
              />
              <Switch
                label="Modo impostor"
                description="Cada ronda, alguien no verá la pregunta"
                checked={impostor}
                onChange={setImpostor}
              />
              <ChipGroup
                label="Paquetes de preguntas"
                value={packs}
                onChange={setPacks}
                options={[
                  { value: "geo", label: "Geografía" },
                  { value: "ciencia", label: "Ciencia" },
                  { value: "historia", label: "Historia" },
                  { value: "friki", label: "Informática" },
                  { value: "cine", label: "Cine y series" },
                ]}
              />
              <SegmentedControl
                label="Siguiente ronda"
                value={next}
                onChange={setNext}
                options={[
                  { value: "host", label: "La pasa el anfitrión" },
                  { value: "auto", label: "Automática" },
                ]}
              />
            </>
          ) : (
            <DetailList
              items={[
                { label: "Rondas", value: "10", icon: "flag" },
                { label: "Segundos por ronda", value: "30 s", icon: "clock" },
                { label: "Modo impostor", value: "Sí", icon: "mask" },
                {
                  label: "Paquetes",
                  value: "Geografía, Ciencia, Informática",
                  icon: "ruler",
                },
              ]}
            />
          )}
        </Stack>
      </Stack>
    </Screen>
  );
};

/* 4 ─ Round ───────────────────────────────────────────────────────────────────────────────── */
type Q = (typeof QUESTIONS)[keyof typeof QUESTIONS];
export interface RoundProps {
  q?: Q;
  impostor?: boolean;
  initial?: number | null;
  /** Value the server has; undefined = not sent yet. */
  sent?: number;
  /** Rule: locked after Enviar · editable until the deadline. */
  editRule?: "locked" | "editable";
  secondsLeft?: number;
  answered?: number;
  timeUp?: boolean;
  /** 'recovering' demos the banner going from «Reconectando…» to «Conectado». */
  connection?: "connected" | "reconnecting" | "recovering";
  endsEarlyNote?: boolean;
}
export const RoundScreen = ({
  q = QUESTIONS.wall,
  impostor,
  initial = null,
  sent,
  editRule = "locked",
  secondsLeft = 23,
  answered = 7,
  timeUp,
  connection = "connected",
  endsEarlyNote,
}: RoundProps) => {
  const [value, setValue] = useState<number | null>(initial);
  const d = useMemo(
    () => deadline(timeUp ? 0 : secondsLeft),
    [timeUp, secondsLeft]
  );
  const [net, setNet] = useState<"connected" | "reconnecting">(
    connection === "connected" ? "connected" : "reconnecting"
  );
  useEffect(() => {
    if (connection !== "recovering") {
      return;
    }
    const t = window.setInterval(
      () => setNet((n) => (n === "connected" ? "reconnecting" : "connected")),
      3000
    );
    return () => window.clearInterval(t);
  }, [connection]);
  const isSent = sent !== undefined;
  const locked = isSent && editRule === "locked";
  const changed = isSent && value !== sent;
  const players = PLAYERS.slice(0, 12).map((p, i) => ({
    ...p,
    answered: i < answered,
  }));
  let action: ReactNode;
  if (timeUp) {
    action = (
      <Button size="lg" fullWidth disabled icon="clock">
        Se acabó el tiempo
      </Button>
    );
  } else if (!isSent) {
    action = (
      <Button size="lg" fullWidth icon="send" disabled={value === null}>
        Enviar
      </Button>
    );
  } else if (locked) {
    action = (
      <Button size="lg" fullWidth disabled icon="lock">
        Enviado
      </Button>
    );
  } else {
    action = (
      <Button size="lg" fullWidth icon="pencil" disabled={!changed}>
        Cambiar
      </Button>
    );
  }
  return (
    <Screen
      top={
        <TopBar
          gameCode={GAME_CODE}
          round={3}
          totalRounds={10}
          trailing={<Countdown {...d} duration={30} />}
        />
      }
      banner={<ConnectionBanner status={net} />}
      bottom={
        <BottomActionBar
          hint={roundHint({
            endsEarlyNote,
            editable: isSent && !locked,
            changed,
          })}
        >
          <AnswerTracker players={players} compact />
          {action}
        </BottomActionBar>
      }
    >
      <Stack gap={4} grow>
        <QuestionCard question={q.text} unit={q.unit} impostor={impostor} />
        <EstimateRuler
          min={q.min}
          max={q.max}
          unit={q.unit}
          step={q.step}
          value={value}
          onChange={setValue}
          sentValue={sent ?? null}
          locked={locked}
          disabled={timeUp}
        />
      </Stack>
    </Screen>
  );
};

/* 5 ─ After sending (waiting for the others) ─────────────────────────────────────────────── */
export const WaitingScreen = ({
  everyoneIn,
  editRule = "locked",
}: {
  everyoneIn?: boolean;
  editRule?: "locked" | "editable";
}) => {
  const d = useMemo(() => deadline(everyoneIn ? 18 : 14), [everyoneIn]);
  const players = PLAYERS.slice(0, 8).map((p, i) => ({
    ...p,
    status: (everyoneIn || i < 5 ? "answered" : "waiting") as
      | "answered"
      | "waiting",
    host: p.id === HOST.id,
  }));
  return (
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
        <BottomActionBar
          hint={
            !everyoneIn && editRule === "editable"
              ? "Puedes cambiarla hasta que acabe el tiempo"
              : undefined
          }
        >
          {editRule === "editable" ? (
            <Button size="lg" fullWidth variant="secondary" icon="pencil">
              Cambiar mi estimación
            </Button>
          ) : (
            <Button size="lg" fullWidth disabled icon="lock">
              Enviado
            </Button>
          )}
        </BottomActionBar>
      }
    >
      <Stack gap={5}>
        <Stack
          gap={3}
          align="center"
          className="border-line bg-success-soft rounded-lg border-2 p-5 text-center"
        >
          <Badge
            tone="success"
            variant="solid"
            icon="check"
            className="animate-stamp"
          >
            Enviado
          </Badge>
          <Text size="sm" tone="muted">
            Tu estimación
          </Text>
          <span className="condensed text-estimate text-ink leading-none font-extrabold">
            21.000
          </span>
          <Text tone="muted">km</Text>
        </Stack>
        {everyoneIn ? (
          <Text align="center" weight="bold" tone="success">
            ¡Ya habéis respondido todos! Esperando al final del tiempo…
          </Text>
        ) : null}
        <PlayerList players={players} youId={YOU.id} showAnswerStatus />
      </Stack>
    </Screen>
  );
};

/* 6 ─ Reveal ──────────────────────────────────────────────────────────────────────────────── */
const { everest } = QUESTIONS;
const baseEstimates: RevealEstimate[] = [
  { player: byId("p-lucia"), value: 8500 },
  { player: byId("p-mario"), value: 6000 },
  { player: byId("p-ines"), value: 8550 },
  { player: byId("p-dani"), value: 7400 },
  { player: byId("p-sofia"), value: 4200 },
  { player: byId("p-nuria"), value: 8000 },
];
export const RevealScreen = ({
  viewer,
  advance = "host",
  impostorEstimate = "none",
  missing,
}: {
  viewer: Role;
  advance?: "host" | "auto";
  impostorEstimate?: "none" | "competes" | "apart" | "hidden";
  missing?: boolean;
}) => {
  const d = useMemo(() => deadline(7), []);
  let est = [...baseEstimates];
  if (impostorEstimate === "competes") {
    est.push({ player: byId("p-alex"), value: 8700 });
  }
  if (impostorEstimate === "apart") {
    est.push({ player: byId("p-alex"), value: 8700, excluded: true });
  }
  if (missing) {
    est = est.map((e) => (e.player.id === YOU.id ? { ...e, value: null } : e));
  }
  const win = closestIds(est, everest.solution);
  const entries = est.map((e) => ({
    ...e,
    points: e.value !== null && win.has(e.player.id) ? 3 : 0,
    reason: win.has(e.player.id) ? ("closest" as const) : undefined,
  }));
  const hostName = HOST.name;
  return (
    <Screen
      top={<TopBar gameCode={GAME_CODE} round={3} totalRounds={10} />}
      bottom={
        <BottomActionBar
          hint={
            advance === "host" && viewer === "player"
              ? `${hostName} pasará a la siguiente ronda`
              : undefined
          }
        >
          {advance === "auto" && (
            <Countdown
              variant="bar"
              label="Siguiente ronda en"
              {...d}
              duration={10}
            />
          )}
          {advance === "host" && viewer === "host" && (
            <Button size="lg" fullWidth icon="arrow-right">
              Siguiente ronda
            </Button>
          )}
        </BottomActionBar>
      }
    >
      <Stack gap={5}>
        <QuestionCard question={everest.text} unit={everest.unit} />
        <RevealRuler
          min={everest.min}
          max={everest.max}
          unit={everest.unit}
          solution={everest.solution}
          estimates={est}
          height={300}
        />
        <RevealList
          unit={everest.unit}
          solution={everest.solution}
          entries={entries}
          youId={YOU.id}
        />
      </Stack>
    </Screen>
  );
};

/* 7 ─ Voting ──────────────────────────────────────────────────────────────────────────────── */
export const VotingScreen = ({
  state = "choosing",
  rule = "final",
  selfVote = "allowed",
  youAreImpostor,
}: {
  state?: "choosing" | "voted";
  rule?: "final" | "changeable";
  selfVote?: "allowed" | "forbidden";
  youAreImpostor?: boolean;
}) => {
  const [pick, setPick] = useState<string | null>(
    state === "voted" ? "p-dani" : null
  );
  const [voted, setVoted] = useState(state === "voted");
  const d = useMemo(() => deadline(16), []);
  const candidates = PLAYERS.slice(0, 6);
  const locked = voted && rule === "final";
  if (youAreImpostor && selfVote === "forbidden") {
    return (
      <Screen
        top={
          <TopBar
            gameCode={GAME_CODE}
            round={3}
            totalRounds={10}
            trailing={<Countdown {...d} duration={20} />}
          />
        }
        centered
      >
        <EmptyState
          icon="mask"
          title="Esta vez no votas"
          description="Eras el impostor. Cruza los dedos: si no te pillan, te llevas 5 puntos."
        />
      </Screen>
    );
  }
  return (
    <Screen
      top={
        <TopBar
          gameCode={GAME_CODE}
          round={3}
          totalRounds={10}
          trailing={<Countdown {...d} duration={20} />}
        />
      }
      bottom={
        <BottomActionBar hint={votingHint(voted, locked)}>
          {voted ? (
            <Button
              size="lg"
              fullWidth
              disabled
              icon={locked ? "lock" : "check"}
            >
              {locked ? "Voto enviado" : "Toca otra persona para cambiarlo"}
            </Button>
          ) : (
            <Button
              size="lg"
              fullWidth
              icon="vote"
              disabled={!pick}
              onClick={() => setVoted(true)}
            >
              Votar
            </Button>
          )}
        </BottomActionBar>
      }
    >
      <Stack gap={4}>
        <Stack gap={1}>
          <Heading level={1}>¿Quién era el impostor?</Heading>
          <Text tone="muted">
            Alguien no vio la pregunta. Vota a quien creas que se lo inventó.
          </Text>
        </Stack>
        <Grid cols={2}>
          {candidates.map((p) => {
            const self = p.id === YOU.id;
            return (
              <VoteOption
                key={p.id}
                player={p}
                selected={pick === p.id}
                voted={voted && pick === p.id}
                locked={locked}
                disabled={self && selfVote === "forbidden"}
                note={selfNote(self, selfVote)}
                onSelect={() => setPick(p.id)}
              />
            );
          })}
        </Grid>
      </Stack>
    </Screen>
  );
};

/* 8 ─ Verdict ─────────────────────────────────────────────────────────────────────────────── */
const imp = byId("p-alex");
const verdictVoteTarget = (index: number) => {
  if (index === 4) {
    return null;
  }
  return index % 3 === 0 ? byId("p-dani") : imp;
};
const voteRecords: VoteRecord[] = PLAYERS.slice(0, 6)
  .filter((p) => p.id !== imp.id)
  .map((p, i) => ({
    voter: p,
    target: verdictVoteTarget(i),
  }));
export const VerdictScreen = ({
  outcome,
  showVotes,
  catchersScore,
  detail,
}: {
  outcome: "caught" | "escaped" | "none";
  showVotes?: boolean;
  catchersScore?: boolean;
  detail?: string;
}) => {
  const catchers = voteRecords
    .filter((v) => v.target?.id === imp.id)
    .map((v) => v.voter);
  return (
    <Screen
      top={<TopBar gameCode={GAME_CODE} round={3} totalRounds={10} />}
      bottom={
        <BottomActionBar>
          {/* Local navigation: only this phone moves to the scoreboard. */}
          <Button size="lg" fullWidth icon="arrow-right">
            Ver clasificación
          </Button>
        </BottomActionBar>
      }
    >
      <Stack gap={5}>
        <VerdictCard
          outcome={outcome}
          impostor={imp}
          impostorPoints={outcome === "escaped" ? 5 : 0}
          votes={showVotes ? voteRecords : undefined}
          detail={detail}
        />
        {catchersScore && outcome === "caught" ? (
          <Stack gap={2}>
            <Heading level={2}>Le habéis pillado</Heading>
            {catchers.map((p) => (
              <Stack
                key={p.id}
                direction="row"
                align="center"
                gap={3}
                className="border-line-subtle bg-surface-raised rounded-md border-2 px-3 py-2"
              >
                <Avatar player={p} size="sm" />
                <Text weight="bold" className="flex-1">
                  {p.name}
                </Text>
                <ScoreDelta points={1} reason="caught" size="sm" />
              </Stack>
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Screen>
  );
};

/* 9 ─ Scoreboard ──────────────────────────────────────────────────────────────────────────── */
export const roundRows: ScoreRow[] = [
  {
    ...byId("p-lucia"),
    score: 14,
    delta: 3,
    deltaReason: "closest",
    previousRank: 2,
  },
  {
    ...byId("p-alex"),
    score: 12,
    delta: 5,
    deltaReason: "impostor",
    previousRank: 4,
  },
  { ...byId("p-mario"), score: 11, delta: 0, previousRank: 1 },
  { ...byId("p-ines"), score: 9, delta: 0, previousRank: 3 },
  { ...byId("p-dani"), score: 6, delta: 0, previousRank: 5 },
  { ...byId("p-sofia"), score: 3, delta: 0, previousRank: 6 },
];
export const ScoreboardScreen = ({
  viewer = "host",
  advance = "host",
  when = "every",
}: {
  viewer?: Role;
  advance?: "host" | "auto";
  when?: "every" | "end";
}) => {
  const d = useMemo(() => deadline(6), []);
  const bar = (
    <BottomActionBar
      hint={
        advance === "host" && viewer === "player"
          ? `${HOST.name} pasará a la siguiente ronda`
          : undefined
      }
    >
      {advance === "auto" && (
        <Countdown variant="bar" label="Ronda 4 en" {...d} duration={10} />
      )}
      {advance === "host" && viewer === "host" && (
        <Button size="lg" fullWidth icon="arrow-right">
          Ronda 4
        </Button>
      )}
    </BottomActionBar>
  );
  if (when === "end") {
    return (
      <Screen
        top={<TopBar gameCode={GAME_CODE} round={3} totalRounds={10} />}
        bottom={bar}
        centered
      >
        <Stack gap={4} align="center">
          <Heading level={1} align="center">
            Ronda 3 terminada
          </Heading>
          <ScoreDelta points={0} />
          <Text tone="muted" align="center">
            La clasificación se desvela al final. ¡Suerte en la siguiente!
          </Text>
        </Stack>
      </Screen>
    );
  }
  return (
    <Screen
      top={<TopBar gameCode={GAME_CODE} round={3} totalRounds={10} />}
      bottom={bar}
    >
      <Stack gap={4}>
        <Heading level={1}>Clasificación</Heading>
        <Scoreboard rows={roundRows} youId={YOU.id} />
      </Stack>
    </Screen>
  );
};

/* 10 ─ Final ranking ─────────────────────────────────────────────────────────────────────── */
export const FinalScreen = ({ viewer = "host" }: { viewer?: Role }) => {
  const players = withScores([23, 19, 17, 14, 12, 8, 5, 3]);
  const winner = players[0]?.name;
  return (
    <Screen
      top={<TopBar gameCode={GAME_CODE} />}
      bottom={
        <BottomActionBar
          hint={
            viewer === "player"
              ? `Si ${HOST.name} juega otra vez, seguirás en la misma partida`
              : undefined
          }
        >
          {viewer === "host" ? (
            <Button size="lg" fullWidth icon="refresh">
              Jugar otra vez
            </Button>
          ) : null}
          <Button
            variant={viewer === "host" ? "ghost" : "secondary"}
            fullWidth
            icon="log-out"
          >
            Salir
          </Button>
        </BottomActionBar>
      }
    >
      <Stack gap={2}>
        <Heading level={1} size="display" align="center">
          ¡Ganó {winner}!
        </Heading>
        <Text tone="muted" align="center">
          10 rondas · {players.length} jugadores
        </Text>
        <FinalPodium players={players} youId={YOU.id} />
      </Stack>
    </Screen>
  );
};

/* 11 ─ Errors ─────────────────────────────────────────────────────────────────────────────── */
export const ErrorScreen = ({
  kind,
}: {
  kind: "unknown" | "started" | "full" | "closed" | "duplicate";
}) => {
  if (kind === "unknown") {
    return (
      <HomeScreen code="KQZX" error="No hay ninguna partida con ese código" />
    );
  }
  if (kind === "duplicate") {
    return (
      <NicknameScreen
        initial="Lucía"
        error="Ya hay una Lucía en esa partida. Elige otro apodo."
      />
    );
  }
  const copy = {
    started: {
      icon: "clock" as const,
      title: "Esta partida ya ha empezado",
      text: "Pide que te esperen a la próxima, o crea tu propia partida.",
    },
    full: {
      icon: "users" as const,
      title: "La partida está llena",
      text: "Ya hay 20 de 20 jugadores. Prueba con otra partida.",
    },
    closed: {
      icon: "log-out" as const,
      title: `${HOST.name} ha cerrado la partida`,
      text: "Quien creó la partida se ha ido, así que ya no se puede seguir jugando.",
    },
  }[kind];
  return (
    <Screen
      centered
      bottom={
        <BottomActionBar>
          <Button size="lg" fullWidth icon="chevron-left">
            Volver al inicio
          </Button>
        </BottomActionBar>
      }
    >
      <EmptyState
        icon={copy.icon}
        tone="danger"
        title={copy.title}
        description={copy.text}
      />
    </Screen>
  );
};

/** Joining after the start, when allowed: you wait for the next round. */
export const LateJoinScreen = () => {
  const d = useMemo(() => deadline(12), []);
  return (
    <Screen
      top={
        <TopBar
          gameCode={GAME_CODE}
          round={3}
          totalRounds={10}
          trailing={<Countdown {...d} duration={30} />}
        />
      }
      centered
    >
      <EmptyState
        icon="clock"
        title="Entras en la siguiente ronda"
        description="La ronda 3 ya está en marcha. Mientras, mira quién juega."
      />
      <PlayerList
        players={PLAYERS.slice(0, 5).map((p) => ({
          ...p,
          host: p.id === HOST.id,
        }))}
      />
    </Screen>
  );
};

export const duplicatePlayers = withDistinctNames([
  { id: "p-ana1", name: "Ana" },
  { id: "p-mario", name: "Mario" },
  { id: "p-ana2", name: "Ana" },
  { id: "p-lucia", name: "Lucía" },
]);
