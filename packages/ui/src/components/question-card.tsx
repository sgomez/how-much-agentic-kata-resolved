import { Icon } from "./icon.tsx";

export interface QuestionCardProps {
  /** The question text. Ignored when impostor is true. */
  question?: string;
  /** Unit of the answer: "km", "personas", "habitantes por km²". */
  unit: string;
  /** Impostor view: only the unit, plus a quiet "Eres el impostor". Same size and colour as a normal card so a glance from the side gives nothing away. */
  impostor?: boolean;
}

/** The round's question and unit, or the impostor's unit-only version. */
export const QuestionCard = ({
  question,
  unit,
  impostor = false,
}: QuestionCardProps) => (
  <section
    aria-label="Pregunta"
    className="border-line bg-surface-raised shadow-sticker rounded-lg border-2 p-4"
  >
    {impostor ? (
      <>
        <div aria-hidden="true" className="flex flex-col gap-2 py-1">
          <span className="bg-surface-sunken h-4 w-full rounded-sm" />
          <span className="bg-surface-sunken h-4 w-4/5 rounded-sm" />
        </div>
        <p className="text-ink-muted m-0 mt-2 flex items-center gap-1.5 text-sm">
          <Icon name="mask" size={16} />
          <span>Eres el impostor. Disimula.</span>
        </p>
      </>
    ) : (
      <h2 className="font-display text-heading text-ink m-0 font-bold text-pretty">
        {question}
      </h2>
    )}
    <p className="border-line-subtle text-ink-muted m-0 mt-3 flex items-baseline gap-2 border-t-2 border-dashed pt-3 text-sm">
      <span>Responde en</span>
      <strong className="text-ink min-w-0 text-lg break-words">{unit}</strong>
    </p>
  </section>
);
