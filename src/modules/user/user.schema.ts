import { z } from "zod";

export const User = z.object({
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
  phoneNumber: z.string().min(2).max(20).optional(),
});

export type UserSchema = z.infer<typeof User>;

export const EmailValidation = z.object({
  email: z
    .string({
      required_error: "Emails is required",
      invalid_type_error: "Email has an invalid type not string",
    })
    .email({ message: "Invalid email format " }),
});

export const CheckoutForm = z.object({
  name: z.string().min(2).max(50),
  phoneNumber: z.string().min(5).max(20),
  email: z.string().email().max(40),
  address: z.string().min(2).max(250),
  acceptTerms: z.boolean(),
});

export type CheckoutFormSchema = z.infer<typeof CheckoutForm>;
