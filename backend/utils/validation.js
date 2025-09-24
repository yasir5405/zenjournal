import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string({ error: "Name is required." })
    .min(2, { error: "Name must be at least 2 characters long." })
    .max(100, { error: "Name must be less than 100 characters." }),
  email: z.email({ error: "Enter valid email." }),
  password: z
    .string({ error: "Password is required." })
    .min(8, { error: "Password must be at least 8 characters long." })
    .max(100, { error: "Password must be less than 100 characters long." }),
});

export const loginSchema = z.object({
  email: z.email({ error: "Enter a valid email." }),
  password: z
    .string({ error: "Password is required." })
    .min(8, { error: "Password must be at least 8 characters long." })
    .max(100, { error: "Password must be less than 100 characters long." }),
});

export const journalEntrySchema = z.object({
  title: z
    .string({ message: "Title is required." })
    .min(1, { message: "Title cannot be empty." })
    .max(200, { message: "Title must be less than 200 characters." })
    .trim(),
  content: z
    .string({ message: "Content is required." })
    .min(1, { message: "Content cannot be empty." })
    .trim(),
});

export const updateJournalEntrySchema = z.object({
  title: z
    .string({ message: "Title must be a string." })
    .min(1, { message: "Title cannot be empty." })
    .max(200, { message: "Title must be less than 200 characters." })
    .trim()
    .optional(),
  content: z
    .string({ message: "Content must be a string." })
    .min(1, { message: "Content cannot be empty." })
    .trim()
    .optional(),
}).refine(
  (data) => data.title !== undefined || data.content !== undefined,
  {
    message: "At least one field (title or content) must be provided for update.",
  }
);
