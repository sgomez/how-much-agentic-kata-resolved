/** A numeric question players estimate. See GLOSSARY.md. */
export interface Question {
  id: string;
  text: string;
  unit: string;
  solution: number;
  pack: string;
  /** Lower bound of the estimate ruler. */
  min: number;
  /** Upper bound of the estimate ruler. */
  max: number;
}
