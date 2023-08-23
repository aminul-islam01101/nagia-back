import prisma from "@db/prisma.db";
import { type Account, Role } from "@prisma/client";
import type { UserSchema } from "@modules/user/user.schema"
import { exclude } from "@utils/prisma.helper";
import { hashPassword } from "@utils/hash.helper";

export class AdminService {
  async findByUsernameService(username: string): Promise<Account | null> {
    return await prisma.account.findFirst({
      where: { username },
    });
  }

  async findByEmailService(email: string): Promise<Account | null> {
    return await prisma.account.findFirst({
      where: { email },
    });
  }


  async findAccountByIdService(id: string): Promise<Account | null> {
    return await prisma.account.findFirst({
      where: { id },
    });
  }

  async createAdminAccount(data: UserSchema): Promise<Omit<Account, "password">> {
    const hashedPassword = await hashPassword(data.password);
    const created = await prisma.account.create({
      data: {
        ...data,
        password: hashedPassword,
        role: Role.ADMIN,
        isVerified: true,
      }
   })
    return exclude(created, ["password"])
  }
}
