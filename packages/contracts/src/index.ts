import { z } from "zod";

/** Body of every error response returned by a service (see `@hmk/kit`). */
export const ErrorBody = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});
export type ErrorBody = z.infer<typeof ErrorBody>;
