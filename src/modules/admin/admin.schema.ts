import { z } from "zod"

export const Admin = z.object({
  email: z
    .string({
      required_error: "Emails is required",
      invalid_type_error: "Email has an invalid type not string",
    })
    .email({ message: "Invalid email format" }),
  username: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    })
    .max(20, { message: "Username must be maximum of 20 characters" })
    .min(3, { message: "Username must be minimum of 3 characters" }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
});
