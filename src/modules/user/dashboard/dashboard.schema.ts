import { z } from "zod";

export const PaginationParams = z.object({
  page: z.string().min(1),
  limit: z.string().min(1),
});

export type PaginationSchema = z.infer<typeof PaginationParams>;

export const BuyProductSchema = z.object({
  investmentOpportunityId: z.string(),
  quantity: z.number().min(10),
  email: z.string().email(),
  amount: z.number().min(0, { message: "Amount is an unreasonable value" }),
  currency: z.string({
    required_error: "Currency can't be empty",
    invalid_type_error: "Currency is not of type string",
  }),
  paymentMethod: z.string(),
});

export type BuyProductType = z.infer<typeof BuyProductSchema>;

export const SellProductSchema = z.object({
  investmentOpportunityId: z.string().cuid(),
  quantity: z.number().min(1),
   phoneNumber: z.string(),
});

export type SellProductType = z.infer<typeof SellProductSchema>;

export const UpdatePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z
    .string({
      invalid_type_error: "Password must be of type string",
      required_error: "Passowrd is required",
    })
    .min(8, { message: "Password can't be less than 8 characters" }),
});

export type UpdatePasswordType = z.infer<typeof UpdatePasswordSchema>;

export const UpdateUserInfoSchema = z.object({
  fullname: z.string().optional(),
  phoneNumber: z.string().optional(),
  profileImage: z.string().optional(),
  username: z.string().optional(),
});

export type UpdateUserInfoType = z.infer<typeof UpdateUserInfoSchema>;

export const AccountDetailsSchema = z.object({
  bankName: z.string(),
  accountNumber: z.string(),
  accountHolderName: z.string(),
});

export type AccountDetailsType = z.infer<typeof AccountDetailsSchema>;

export const PaymentDetailsSchema = z.object({
  cardHolderName: z.string(),
  cardNumber: z.string().min(12).max(19),
  expiryMonth: z.number().min(1).max(12),
  expiryYear: z.number().min(new Date().getFullYear()),
  cvv: z.number().min(3).max(6),
});

export type PaymentDetailsType = z.infer<typeof PaymentDetailsSchema>;

export const ValidCUID = z.object({
  id: z.string().cuid(),
});

export interface InvestmentStats {
  totalInvestment: number;
  activeInvestment: number;
  grossYield: number;
  netYield: number;
  potentialEquity: number;
}
