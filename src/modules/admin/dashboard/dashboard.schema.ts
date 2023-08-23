import { z } from "zod";

export const AdminSendEmail = z.object({
  emails: z.array(
    z
      .string({
        required_error: "Emails is required",
        invalid_type_error: "Email has an invalid type not string",
      })
      .email({ message: "Invalid email format" })
  ),
  subject: z
    .string({
      required_error: "subject is required",
      invalid_type_error: "subject must be a string",
    })
    .max(20, { message: "subject must be maximum of 50 characters" })
    .min(3, { message: "subject must be minimum of 3 characters" }),
  content: z.string().min(10, {
    message: "content must be at least 10 characters long",
  }),
});

export type AdminSendEmailSchema = z.infer<typeof AdminSendEmail>;

export const InvestmentNews = z.object({
  title: z
    .string()
    .min(3, { message: "title must be more than 3 characters." })
    .max(35, { message: "Title must not be more than 35 characters." }),
  description: z.string({
    required_error: "description is required",
    invalid_type_error: "description must be a string",
  }),
  link: z
    .string({
      required_error: "link is required",
      invalid_type_error: "link must be a string",
    })
    .url({ message: "link must be a valid url" })
    .optional(),
  source: z
    .string({
      required_error: "source is required",
      invalid_type_error: "source must be a string",
    })
    .optional(),
  image: z
    .string({
      required_error: "image is required",
      invalid_type_error: "image must be a string",
    })
    .url({ message: "image must be a valid url" }),
});

export type InvestmentNewsSchema = z.infer<typeof InvestmentNews>;

export const InvestmentOpportunities = z.object({
  title: z
    .string({
      required_error: "Title is required",
      invalid_type_error: "Title must be a string",
    })
    .min(3, { message: "Title must have at least 3 characters." })
    .max(35, { message: "Title must have at most 35 characters." }),
  amount: z
    .number({
      required_error: "amount is required",
      invalid_type_error: "amount must be a number",
    })
    .min(0),
  image: z
    .string({
      required_error: "image is required",
      invalid_type_error: "image must be a string",
    })
    .url({ message: "image must be a valid url" }),
  growthRate: z
    .number({
      required_error: "growth rate is required",
      invalid_type_error: "growth rate must be a string",
    })
    .min(0)
    .optional(),
});

export type InvestmentOpportunitiesSchema = z.infer<typeof InvestmentOpportunities>;

export const NewsIdParams = z.object({
  newsId: z.string().cuid(),
});

export const OpportunityIdParams = z.object({
  opportunityId: z.string().cuid(),
});

export const UserIdParams = z.object({
  userId: z.string().cuid(),
});

export const VerifyUserPayment = z.object({
  userInvestmentId: z.string().cuid(),
  quantity: z.number().min(1, { message: "Value can't be less than 1" }),
});
