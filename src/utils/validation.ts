import { z } from "zod";

export const User = z.object({
  id: z
    .string()
    .uuid()
    .default(() => crypto.randomUUID()),
  username: z.string().min(1, "Enter Your Username"),
  email: z.string().email(),
  passwordHash: z
    .string()
    .min(8, "Password should at least 8 characters")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
      "Minimum 8 characters, at least 1 letter, 1 number and special character",
    ),
});
export const Todos = z.object({
  userId: z.string().uuid().min(1, "user id required"),
  title: z.string().min(1, "Title required"),
  descirption: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  deadline: z.date().min(new Date(Date.now()), {
    message: "Please select a date from today onwards. ",
  }),
  status: z.enum(["todo", "in_progress", "done"]),
});

export const Token = z.object({
  userId: z.string().uuid().min(1, "user id required"),
  token: z.string().min(1, "Token required"),
});

export type User = z.infer<typeof User>;
export type Todos = z.infer<typeof Todos>;
