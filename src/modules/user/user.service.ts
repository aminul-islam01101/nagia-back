import prisma from "@db/prisma.db";
import type { Account, Checkout, Prisma } from "@prisma/client";
import { exclude } from "@utils/prisma.helper";
import type { CheckoutFormSchema, UserSchema } from "./user.schema";

export class UserService {
  async findByUsernameService(username: string): Promise<Account | null> {
    return await prisma.account.findFirst({
      where: { username },
      include: { profile: {} },
    });
  }

  async findByEmailService(email: string): Promise<Account | null> {
    return await prisma.account.findFirst({
      where: { email },
      include: { profile: {} },
    });
  }

  async createAccountService(account: UserSchema): Promise<Omit<Account, "password">> {
    const created = await prisma.account.create({
      data: {
        email: account.email,
        username: account.username,
        password: account.password,
        profile: {
          create: {
            phoneNumber: account.phoneNumber,
          },
        },
      },
    });
    return exclude(created, ["password"]);
  }

  async findAccountByIdService(id: string): Promise<Account | null> {
    return await prisma.account.findFirst({
      where: { id },
      include: { profile: {} },
    });
  }

  async getAllAccountsService(): Promise<Account[] | null> {
    return await prisma.account.findMany({
      include: { profile: {} },
    });
  }

  async updateAccountService<T>(id: string, data: Record<string, T>): Promise<Account> {
    return await prisma.account.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteAccountService(id: string): Promise<Account> {
    return await prisma.account.delete({
      where: {
        id,
      },
    });
  }

  async deleteAllAccountsService(): Promise<Prisma.BatchPayload> {
    return await prisma.account.deleteMany();
  }

  async createCheckout(data: CheckoutFormSchema, accountId: string): Promise<Checkout> {
    return await prisma.checkout.create({
      data: {
        ...data,
        accountId,
      },
    });
  }
}
