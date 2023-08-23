import { z } from "zod";

export const ContactUs = z.object({
  fullname: z
    .string({
      required_error: "Fullname is required",
      invalid_type_error: "Fullname is not of type string",
    })
    .min(2, {
      message: "Fullname can't be less than 2 characters",
    })
    .max(35, {
      message: "Fullname can't be more than 35 characters",
    }),
  email: z
    .string({
      required_error: "Emails is required",
      invalid_type_error: "Email has an invalid type not string",
    })
    .email({ message: "Invalid email format" }),
  phoneNumber: z
    .string({
      required_error: "Phone number is required",
      invalid_type_error: "Phone number is not of type string",
    })
    .min(8, { message: "Phone number must be at least 8 digits" })
    .max(12, { message: "Phone number cannot be more than 12 digits" })
    .regex(/^\d+$/, { message: "Phone number must only contain digits" }),
  message: z
    .string({
      required_error: "Message is required",
    })
    .min(3, {
      message: "Message can't be a smaller of 3 characters",
    })
    .max(255, {
      message: "Message can't be bigger than 255 characters",
    }),
});

export type ContactUsSchema = z.infer<typeof ContactUs>;
