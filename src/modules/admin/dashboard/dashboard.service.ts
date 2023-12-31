import prisma from "@db/prisma.db";
import type { Account, Prisma } from "@prisma/client";
import type {
  AccountDetails,
  InvestmentNews,
  InvestmentOpportunity,
  SellRequests,
  UserInvestment,
  Transaction,
  TransactionType,
} from ".prisma/client";
import { sendMail } from "@utils/sendgrid";
import type { PaginationOptions } from "@interfaces/basic.types";
import { NotFoundError } from "@error/api.error";
import type { PaginationSchema } from "@modules/user/dashboard/dashboard.schema";

export class DashboardService {
  async getAllUsers(options: PaginationOptions): Promise<Record<string, any>> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;
    const users = await prisma.account.findMany({
      skip,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            phoneNumber: true, // Include phoneNumber from the Profile schema
          },
        },
      },
    });
    const count = await prisma.account.count();
    const totalPage = Math.ceil(count / limit);
    const hasNextPage = page < totalPage;
    const hasPrevPage = page > 1;
    return {
      users,
      totalPage,
      page,
      limit,
      hasNextPage,
      hasPrevPage,
    };
  }

  async findAccountByIdService(id: string): Promise<Account | null> {
    return await prisma.account.findFirst({
      where: { id },
    });
  }

  async deleteUserById(id: string): Promise<Account | null> {
    await prisma.profile.delete({
      where: {
        userId: id,
      },
    });
    return await prisma.account.delete({
      where: { id },
    });
  }

  async sendMailToUsers(emails: string[], subject: string, content: string): Promise<void> {
    // Implement sending emails to users here.
    await sendMail(emails, subject, content);
  }

  async approveTransaction(
    sellProductId: string,
    userInvestmentId: string,
    quantity: number,
    transactionId: string
  ): Promise<[SellRequests, UserInvestment]> {
    const userInvestment = await prisma.userInvestment.findUnique({
      where: { id: userInvestmentId },
    });
    if (userInvestment === null) throw new Error("User investment not found");
    // reduce the quantity
    const newQuantity = userInvestment.quantity - quantity;
    let userInvestment_;
    if (newQuantity < 0) throw new Error("Product is less than 0 and can't be gotten");
    if (newQuantity <= 0) {
      userInvestment_ = prisma.userInvestment.delete({
        where: {
          id: userInvestment.id,
        },
      });
    } else {
      userInvestment_ = prisma.userInvestment.update({
        where: { id: userInvestment.id },
        data: {
          quantity: {
            decrement: quantity,
          },
          sellRequestQuantity: {
            decrement: quantity,
          },
          soldQuantity: {
            increment: quantity,
          },
          purchasePrice: {
            decrement: userInvestment.purchasePrice - quantity * userInvestment.purchasePrice,
          },
          transactionType: "Cashout",
        },
      });
    }
    const sellRequest = prisma.sellRequests.update({
      where: { id: sellProductId },
      data: { status: 'approved' },
    });
    // const sellProduct_ = await prisma.sellProduct.findUnique({
    //   where: { id: sellProductId },
    // });

    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: "Sold" },
    });
    return await prisma.$transaction([sellRequest, userInvestment_,]);
  }

  async getUserInvestmenById(id: string): Promise<UserInvestment | null> {
    return await prisma.userInvestment.findUnique({
      where: { id },
      include: {
        investmentOpportunity: true,
      },
    });
  }

  async getAllTransactions(params: PaginationSchema): Promise<Record<string, any>> {
    const { page, limit } = params;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);

    const skip = (pageNumber - 1) * pageSize;

    const transaction = await prisma.transaction.findMany({
      take: pageSize,
      skip,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        investmentOpportunity: {},
        account: {
          select: {
            username: true,
            email: true,
            AccountDetails: true,
          },
        },
      },
    });

    const count = await prisma.transaction.count();
    const totalPage = Math.ceil(count / pageSize);
    const hasNextPage = pageNumber < totalPage;
    const hasPrevPage = pageNumber > 1;
    return {
      transaction,
      totalPage,
      hasPrevPage,
      hasNextPage,
      page: pageNumber,
      limit: pageSize,
    };
  }

  async getSellProducts(options: PaginationOptions): Promise<Record<string, any>> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;
    const sell = await prisma.sellRequests.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        UserInvestment: {
          include: {
            investmentOpportunity: true,
            user: {
              select: {
                username: true,
                email: true,
                AccountDetails: true,
                PaymentDetails: true,
              },
            },
          },
        },
      },
    });
    const count = await prisma.sellProduct.count();
    const totalPage = Math.ceil(count / limit);
    const hasNextPage = page < totalPage;
    const hasPrevPage = page > 1;
    return {
      sell,
      totalPage,
      page,
      limit,
      hasNextPage,
      hasPrevPage,
    };
  }

  async createInvestmentNews(data: Prisma.InvestmentNewsCreateInput): Promise<InvestmentNews> {
    return await prisma.investmentNews.create({
      data,
    });
  }

  async getAllInvestmentNews(options: PaginationOptions): Promise<Record<string, any>> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;
    const news = await prisma.investmentNews.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });
    const count = await prisma.account.count();
    const totalPage = Math.ceil(count / limit);
    const hasNextPage = page < totalPage;
    const hasPrevPage = page > 1;
    return {
      news,
      totalPage,
      page,
      limit,
      hasNextPage,
      hasPrevPage,
    };
  }

  async getNewsById(newsId: string): Promise<InvestmentNews> {
    const news = await prisma.investmentNews.findUnique({
      where: { id: newsId },
    });

    if (news === null) {
      throw new Error("Investment News not found");
    }

    return news;
  }

  async updateNews(id: string, newsData: Partial<InvestmentNews>): Promise<InvestmentNews | null> {
    return await prisma.investmentNews.update({
      where: { id },
      data: { ...newsData },
    });
  }

  async deleteNews(newsId: string): Promise<void> {
    const news = await prisma.investmentNews.delete({
      where: { id: newsId },
    });

    if (news === null) {
      throw new NotFoundError("Investment news not found");
    }
  }

  async createInvestmentOpportunity(data: Prisma.InvestmentOpportunityCreateInput): Promise<InvestmentOpportunity> {
    return await prisma.investmentOpportunity.create({ data });
  }

  async getAllInvestmentOpportunities(options: PaginationOptions): Promise<Record<string, any>> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;
    const opportunity = await prisma.investmentOpportunity.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });
    const count = await prisma.account.count();
    const totalPage = Math.ceil(count / limit);
    const hasNextPage = page < totalPage;
    const hasPrevPage = page > 1;
    return {
      opportunity,
      totalPage,
      page,
      limit,
      hasNextPage,
      hasPrevPage,
    };
  }

  async getOpportunityById(opportunityId: string): Promise<InvestmentOpportunity> {
    const opportunity = await prisma.investmentOpportunity.findUnique({
      where: { id: opportunityId },
    });

    if (opportunity === null) {
      throw new Error("Investment Opportunity not found");
    }

    return opportunity;
  }

  async updateOpportunity(
    id: string,
    opportunityData: Partial<InvestmentOpportunity>
  ): Promise<InvestmentOpportunity | null> {
    return await prisma.investmentOpportunity.update({
      where: { id },
      data: {
        title: opportunityData.title,
        ...opportunityData,
      },
    });
  }

  async deleteOpportunity(opportunityId: string): Promise<void> {
    const opportunity = await prisma.investmentOpportunity.delete({
      where: { id: opportunityId },
    });

    if (opportunity === null) {
      throw new NotFoundError("Investment opportunity not found");
    }
  }

  async getAccountDetails(id: string): Promise<AccountDetails[] | null> {
    return await prisma.accountDetails.findMany({
      where: {
        id,
      },
    });
  }

  async getPaymentDetails(id: string): Promise<Prisma.PaymentDetailsWhereUniqueInput[] | null> {
    return await prisma.paymentDetails.findMany({ where: { id } });
  }

  async verifyUserPayment(userInvestmentId: string, quantity: number): Promise<UserInvestment> {
    return await prisma.userInvestment.update({
      where: { id: userInvestmentId },
      data: {
        status: "completed",
        quantity: {
          increment: quantity,
        },
        totalInvestment: {
          increment: 1,
        },
      },
    });
  }

  async getUserInvestmentByOpportunity(
    userId: string,
    investmentOpportunityId: string
  ): Promise<UserInvestment | null> {
    const userInvestment = await prisma.userInvestment.findFirst({
      where: {
        userId,
        investmentOpportunityId,
      },
    });

    return userInvestment;
  }

  async adminBuy(
    
    quantity: number,
    amount: number,
    adminEmail: string,
    userEmail: string,
    userAccountId: string,
    investmentOpportunityId: string,
    
   
  ): Promise<UserInvestment> {
    const purchasePrice = amount * quantity;
    const userInvestment = await this.getUserInvestmentByOpportunity(userAccountId, investmentOpportunityId);

    if (userInvestment !== null) {
      return await prisma.userInvestment.update({
        where: { id: userInvestment.id },
        data: {
          purchasePrice: {
            increment: purchasePrice,
          },
          quantity: {
            increment: quantity,
          },
          totalInvestment: {
            increment: 1,
          },
        },
      });
    } else {
      return await prisma.userInvestment.create({
        data: {
          userId: userAccountId,
          investmentOpportunityId,
          quantity,
          purchasePrice,
          totalInvestment: 1,
          status: "completed",
          transactionType: "Deposit",
        },
        include: {
          SellProduct: {},
          user: {},
          investmentOpportunity: {},
        },
      });
    }
  }

  async createTransaction(
    type: TransactionType,
    investmentOpportunityId: string,
    accountId: string,
    amount: number,
    status: string
  ): Promise<Transaction> {
    return await prisma.transaction.create({
      data: {
        transactionType: type,
        investmentOpportunityId,
        accountId,
        amount,
        status,
      },
    });
  }

  async getInvestmentOpportunityById(id: string): Promise<InvestmentOpportunity | null> {
    const investmentOpportunity = await prisma.investmentOpportunity.findUnique({
      where: { id },
    });

    return investmentOpportunity;
  }

}
