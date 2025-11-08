// src/features/sessions/sessionValidation.ts
import { z } from "zod";

// A simple regex for HH:mm format
const timeFormatRegex = /^\d{2}:\d{2}$/;

export const sessionFormSchema = z.object({
  startedAt: z.date({
    error: "A start time is required.",
  }),
  
  duration: z.string({error: "Duration is required."})
    .min(1, { error: "Duration is required." })
    .regex(timeFormatRegex, { error: "Use HH:mm format." })
    .refine(val => val !== "00:00", { error: "Duration cannot be zero." }),
  
  topicId: z.uuid({ error: "Please select a valid topic." }),
});

export type SessionFormData = z.infer<typeof sessionFormSchema>;