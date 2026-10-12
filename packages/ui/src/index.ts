// Public API of @hmk/ui: import from "@hmk/ui" only. Index for agents: packages/ui/COMPONENTS.md.
export { iconNames, Icon } from "./components/icon.tsx";
export type { IconName, IconProps } from "./components/icon.tsx";
export { Spinner } from "./components/spinner.tsx";
export type { SpinnerProps } from "./components/spinner.tsx";
export { buttonVariants, Button } from "./components/button.tsx";
export type { ButtonVariant, ButtonProps } from "./components/button.tsx";
export { IconButton } from "./components/icon-button.tsx";
export type { IconButtonProps } from "./components/icon-button.tsx";
export { Heading, toneText, Text } from "./components/typography.tsx";
export type {
  HeadingProps,
  TextTone,
  TextProps,
} from "./components/typography.tsx";
export { Stack, Grid } from "./components/stack.tsx";
export type { StackProps, GridProps } from "./components/stack.tsx";
export { Card } from "./components/card.tsx";
export type { CardProps } from "./components/card.tsx";
export { Badge } from "./components/badge.tsx";
export type { BadgeTone, BadgeProps } from "./components/badge.tsx";
export { Avatar, AvatarGroup } from "./components/avatar.tsx";
export type {
  AvatarPlayer,
  AvatarProps,
  AvatarGroupProps,
} from "./components/avatar.tsx";
export { Skeleton } from "./components/skeleton.tsx";
export type { SkeletonProps } from "./components/skeleton.tsx";
export { EmptyState } from "./components/empty-state.tsx";
export type { EmptyStateProps } from "./components/empty-state.tsx";
export { Input } from "./components/input.tsx";
export type { InputProps } from "./components/input.tsx";
export { normalizeCode, CodeInput } from "./components/code-input.tsx";
export type { CodeAlphabet, CodeInputProps } from "./components/code-input.tsx";
export { Stepper } from "./components/stepper.tsx";
export type { StepperProps } from "./components/stepper.tsx";
export { Switch } from "./components/switch.tsx";
export type { SwitchProps } from "./components/switch.tsx";
export { ChipGroup } from "./components/chip-group.tsx";
export type { ChipOption, ChipGroupProps } from "./components/chip-group.tsx";
export { SegmentedControl } from "./components/segmented-control.tsx";
export type {
  SegmentOption,
  SegmentedControlProps,
} from "./components/segmented-control.tsx";
export { DetailList } from "./components/detail-list.tsx";
export type { DetailItem, DetailListProps } from "./components/detail-list.tsx";
export { Toast } from "./components/toast.tsx";
export type { ToastProps } from "./components/toast.tsx";
export { BottomSheet } from "./components/bottom-sheet.tsx";
export type { BottomSheetProps } from "./components/bottom-sheet.tsx";
export { Screen } from "./components/screen.tsx";
export type { ScreenProps } from "./components/screen.tsx";
export { TopBar } from "./components/top-bar.tsx";
export type { TopBarProps } from "./components/top-bar.tsx";
export { BottomActionBar } from "./components/bottom-action-bar.tsx";
export type { BottomActionBarProps } from "./components/bottom-action-bar.tsx";
export { ConnectionBanner } from "./components/connection-banner.tsx";
export type { ConnectionBannerProps } from "./components/connection-banner.tsx";
export { GameCodeDisplay } from "./components/game-code-display.tsx";
export type { GameCodeDisplayProps } from "./components/game-code-display.tsx";
export { PlayerList } from "./components/player-list.tsx";
export type {
  PlayerStatus,
  PlayerListItem,
  PlayerListProps,
} from "./components/player-list.tsx";
export { AnswerTracker } from "./components/answer-tracker.tsx";
export type { AnswerTrackerProps } from "./components/answer-tracker.tsx";
export { QuestionCard } from "./components/question-card.tsx";
export type { QuestionCardProps } from "./components/question-card.tsx";
export { Countdown } from "./components/countdown.tsx";
export type { CountdownProps } from "./components/countdown.tsx";
export { EstimateRuler } from "./components/estimate-ruler.tsx";
export type { EstimateRulerProps } from "./components/estimate-ruler.tsx";
export { closestIds, RevealRuler } from "./components/reveal-ruler.tsx";
export type {
  RevealEstimate,
  RevealRulerProps,
} from "./components/reveal-ruler.tsx";
export { RevealList } from "./components/reveal-list.tsx";
export type {
  RevealListEntry,
  RevealListProps,
} from "./components/reveal-list.tsx";
export { ScoreDelta } from "./components/score-delta.tsx";
export type {
  ScoreReason,
  ScoreDeltaProps,
} from "./components/score-delta.tsx";
export { Scoreboard } from "./components/scoreboard.tsx";
export type { ScoreRow, ScoreboardProps } from "./components/scoreboard.tsx";
export { VoteOption } from "./components/vote-option.tsx";
export type { VoteOptionProps } from "./components/vote-option.tsx";
export { VerdictCard } from "./components/verdict-card.tsx";
export type {
  VoteRecord,
  VerdictCardProps,
} from "./components/verdict-card.tsx";
export { FinalPodium } from "./components/final-podium.tsx";
export type { FinalPodiumProps } from "./components/final-podium.tsx";
export {
  decimalsOf,
  formatCompact,
  formatNumber,
  formatPoints,
  formatReadable,
  formatReadableWithUnit,
  formatSigned,
  formatSpoken,
  formatWithUnit,
  parseEsNumber,
} from "./lib/format.ts";
export { chooseScale, createScale } from "./lib/scale.ts";
export type { Scale, ScaleKind, Tick } from "./lib/scale.ts";
export {
  competitionRanks,
  initials,
  playerColorIndex,
  withDistinctNames,
} from "./lib/players.ts";
export type { ServerTime } from "./lib/clock.ts";
