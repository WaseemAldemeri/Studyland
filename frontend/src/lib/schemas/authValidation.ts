import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ message: "Must be a valid email address." }),
  
  password: z.string().min(1, { message: "Password is required." }),
});

// Create a TypeScript type from the schema
export type LoginForm = z.infer<typeof loginSchema>;


export const registerSchema = z.object({
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters." }),

  email: z.email({ error: "Must be a valid email address." }),
  
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),

  confirmPassword: z.string(),
})
// The 'refine' method allows for complex, cross-field validation.
// We are checking if the password and confirmPassword fields are the same.
.refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    // This tells react-hook-form to attach the error to the 'confirmPassword' field.
    path: ["confirmPassword"],
});

// Create a TypeScript type from the schema
export type RegisterForm = z.infer<typeof registerSchema>;