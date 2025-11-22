import { z } from "zod";

export const dailyGoalSchema = z.object({
  // We use a string "HH:mm" for the input, just like the Session form
  duration: z
    .string()
    .regex(/^([0-9]{1,2}):([0-5][0-9])$/, "Format must be HH:mm (e.g. 04:30)")
    .refine((val) => val !== "00:00", "Goal cannot be zero"),
});

export type DailyGoalFormData = z.infer<typeof dailyGoalSchema>;