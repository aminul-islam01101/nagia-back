/* eslint-disable @typescript-eslint/array-type */
import prisma from "@db/prisma.db";
import type { TransactionStat } from "@interfaces/basic.types";
import type {
  Account,
  AccountDetails,
  Checkout,
  InvestmentOpportunity,
  PaymentDetails,
  Prisma,
  SellProduct,
  Transaction,
  TransactionType,
  UserInvestment,
  SellRequests
} from "@prisma/client";
import type {
  AccountDetailsType,
  InvestmentStats,
  PaginationSchema,
  PaymentDetailsType,
  UpdateUserInfoType,
} from "./dashboard.schema";

export class DashboardService {
  async getUser(username: string): Promise<Account | null> {
    return await prisma.account.findFirst({
      where: {
        username,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getUserById(id: string): Promise<Account | null> {
    return await prisma.account.findFirst({
      where: {
        id,
      },
    });
  }

  async getInfoFromCheckout(id: string): Promise<Checkout | null> {
    return await prisma.checkout.findUnique({
      where: {
        id,
      },
    });
  }

  async getCheckoutInfo(accountId: string): Promise<Checkout[]> {
    return await prisma.checkout.findMany({
      where: { accountId },
    });
  }

  async getNews(params: PaginationSchema): Promise<Record<string, any>> {
    const { page, limit } = params;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);

    const skip = (pageNumber - 1) * pageSize;

    const news = await prisma.investmentNews.findMany({
      take: pageSize,
      skip,
      orderBy: {
        createdAt: "desc",
      },
    });

    const count = await prisma.investmentNews.count();
    const totalPage = Math.ceil(count / pageSize);
    const hasNextPage = pageNumber < totalPage;
    const hasPrevPage = pageNumber > 1;
    return {
      news,
      totalPage,
      hasPrevPage,
      hasNextPage,
      page: pageNumber,
      limit: pageSize,
    };
  }

  async getOpportunity(params: PaginationSchema): Promise<Record<string, any>> {
    const { page, limit } = params;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);

    const skip = (pageNumber - 1) * pageSize;

    const opportunity = await prisma.investmentOpportunity.findMany({
      take: pageSize,
      skip,
      orderBy: {
        createdAt: "desc",
      },
    });

    const count = await prisma.investmentOpportunity.count();
    const totalPage = Math.ceil(count / pageSize);
    const hasNextPage = pageNumber < totalPage;
    const hasPrevPage = pageNumber > 1;
    return {
      opportunity,
      totalPage,
      hasPrevPage,
      hasNextPage,
      page: pageNumber,
      limit: pageSize,
    };
  }

  async getOpportunityTittles(): Promise<Promise<Record<string, any>>> {
    const opportunities = await prisma.investmentOpportunity.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedOpportunities = opportunities.map((opportunity) => ({
      label: opportunity.title,
      value: opportunity.amount,
    }));

    return formattedOpportunities;
  }

  async getInvestmentOpportunityById(id: string): Promise<InvestmentOpportunity | null> {
    const investmentOpportunity = await prisma.investmentOpportunity.findUnique({
      where: { id },
    });

    return investmentOpportunity;
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

  async getUserInvestmentById(userInvestmentId: string): Promise<UserInvestment> {
    const userInvesment = await prisma.userInvestment.findUnique({
      where: {
        id: userInvestmentId,
      },
    });
    if (userInvesment === null) throw new Error(`user investment with ${userInvestmentId} not found`);
    return userInvesment;
  }

  async updateInvestmentOpportunity(
    userInvestmentId: string,
    failed: boolean,
    quantity?: number
  ): Promise<UserInvestment> {
    if (failed) {
      return await prisma.userInvestment.delete({
        where: { id: userInvestmentId },
      });
    }
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

  async buyProduct(
    userId: string,
    investmentOpportunityId: string,
    investmentOpportunity: InvestmentOpportunity,
    quantity: number
  ): Promise<UserInvestment> {
    const purchasePrice = investmentOpportunity.amount * quantity;
    const userInvestment = await this.getUserInvestmentByOpportunity(userId, investmentOpportunityId);

    if (userInvestment !== null) {
      return await prisma.userInvestment.update({
        where: { id: userInvestment.id },
        data: {
          purchasePrice: {
            increment: purchasePrice,
          },
        },
      });
    } else {
      return await prisma.userInvestment.create({
        data: {
          userId,
          investmentOpportunityId,
          quantity: 0,
          purchasePrice,
          totalInvestment: 0,
          status: "pending",
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

 

  async sellProduct(userInvestmentId: string, quantity: number, phoneNumber: string, ): Promise<SellProduct> {
    return await prisma.sellProduct.create({
      data: {
        approved: false,
        userInvestmentId,
        quantity,
        phoneNumber,
 

      },
    });
  }

  async  updateUserInvestmentSellRequestQuantity(id: string, quantityToAdd: number):Promise<UserInvestment>  {
   
      // Find the UserInvestment by ID
      const userInvestment = await prisma.userInvestment.findUnique({
        where: { id },
      });
  
      if (userInvestment ===null) {
        throw new Error(`UserInvestment with ID ${id} not found`);
      }
  
      // Update the sellRequestQuantity by adding the specified quantity
      const updatedUserInvestment = await prisma.userInvestment.update({
        where: { id },
        data: {
          sellRequestQuantity: userInvestment.sellRequestQuantity + quantityToAdd,
        },
      });
  
      return updatedUserInvestment;
    }


  async getUserInvestment(userId: string, params: PaginationSchema): Promise<Record<string, any>> {
    const { page, limit } = params;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);

    const skip = (pageNumber - 1) * pageSize;

    const userInvestment = await prisma.userInvestment.findMany({
      where: { userId },
      include: {
        investmentOpportunity: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      take: pageSize,
      skip,
      orderBy: {
        createdAt: "desc",
      },
    });

    if (userInvestment === null) {
      throw new Error("User investment not found");
    }

    const count = await prisma.userInvestment.count({ where: { userId } });
    const totalPage = Math.ceil(count / pageSize);
    const hasNextPage = pageNumber < totalPage;
    const hasPrevPage = pageNumber > 1;
    return {
      userInvestment,
      totalPage,
      hasPrevPage,
      hasNextPage,
      page: pageNumber,
      limit: pageSize,
    };
  }

  async updatePassword(id: string, password: string): Promise<Account> {
    return await prisma.account.update({
      where: {
        id,
      },
      data: {
        password,
      },
    });
  }

  async updateUserInfo(id: string, data: UpdateUserInfoType): Promise<Account> {
    // remove undefined values
    return await prisma.account.update({
      where: {
        id,
      },
      data: {
        username: data.username !== undefined ? data.username : undefined,
        profile: {
          update: {
            fullname: data.fullname !== undefined ? data.fullname : undefined,
            phoneNumber: data.phoneNumber !== undefined ? data.phoneNumber : undefined,
            profileImage: data.profileImage !== undefined ? data.profileImage : undefined,
          },
        },
      },
    });
  }

  async getTransactionHistory(id: string, params: PaginationSchema): Promise<Record<string, any>> {
    const { page, limit } = params;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    const transaction = await prisma.transaction.findMany({
      where: {
        accountId: id,
      },
      include: {
        investmentOpportunity: {},
      },
      take: pageSize,
      skip,
      orderBy: {
        createdAt: "desc",
      },
    });

    const count = await prisma.transaction.count({ where: { accountId: id } });
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


  async  createSellRequest(
    seller: string,
    phoneNumber: string,
    email: string,
    status: string,
    product: string,
    quantity: number,
    amount: number,
    accountId: string,
    investmentOpportunityId: string,
    userInvestmentId: string,
    transactionId: string
  ): Promise<SellRequests>  {
   
      const sellRequest = await prisma.sellRequests.create({
        data: {
          seller,
          phoneNumber,
          email,
          status,
          product,
          quantity,
          amount,
          accountId,
          investmentOpportunityId,
          userInvestmentId,
          transactionId,
        },
      });
      
      return sellRequest;
    }

  async addAccountDetails(userId: string, accountDetailsData: AccountDetailsType): Promise<AccountDetails> {
    const user = await prisma.account.findUnique({ where: { id: userId } });
    if (user === null) {
      throw new Error("User not found");
    }

    return await prisma.accountDetails.create({
      data: {
        ...accountDetailsData,
        user: { connect: { id: userId } },
      },
    });
  }

  async addPaymentDetails(userId: string, paymentDetailsData: PaymentDetailsType): Promise<PaymentDetails> {
    const user = await prisma.account.findUnique({ where: { id: userId } });
    if (user === null) {
      throw new Error("User not found");
    }

    return await prisma.paymentDetails.create({
      data: {
        ...paymentDetailsData,
        user: { connect: { id: userId } },
      },
    });
  }

  async getAccountDetails(userId: string): Promise<AccountDetails[] | null> {
    return await prisma.accountDetails.findMany({ where: { userId } });
  }

  async getPaymentDetails(userId: string): Promise<Prisma.PaymentDetailsWhereUniqueInput[] | null> {
    return await prisma.paymentDetails.findMany({ where: { userId } });
  }

  async getTransactionStats(accountId: string): Promise<TransactionStat> {
    const transactions = await prisma.transaction.findMany({
      where: {
        accountId,
      },
      select: {
        createdAt: true,
        amount: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const dailyStats = this.groupTransactionsBy(transactions, "day");
    const weeklyStats = this.groupTransactionsBy(transactions, "week");
    const monthlyStats = this.groupTransactionsBy(transactions, "month");

    return {
      daily: dailyStats,
      weekly: weeklyStats,
      monthly: monthlyStats,
    };
  }

  groupTransactionsBy(
    transactions: Array<{
      amount: number;
      createdAt: Date;
    }>,
    period: string
  ): Record<string, number> {
    const result: Record<string, number> = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.createdAt);
      let key: string;

      switch (period) {
        case "day":
          key = date.toISOString().slice(0, 10);
          break;
        case "week":
          key = `${this.getWeekNumber(date)}-${date.getFullYear()}`;
          break;
        case "month":
          key = `${date.getMonth() + 1}-${date.getFullYear()}`;
          break;
        default:
          throw new Error("Invalid period");
      }
      if (typeof result[key] !== "number") {
        result[key] = 0;
      }

      result[key] += transaction.amount;
    });

    return result;
  }

  getWeekNumber(d: Date): number {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() === 0 ? 7 : d.getUTCDay()));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return weekNo;
  }

  async calculateInvestmentStats(userId: string): Promise<InvestmentStats> {
    // Fetch user investments
    const investments = await prisma.userInvestment.findMany({
      where: { userId },
      include: { investmentOpportunity: {} },
    });
    //
    let totalInvestment = 0;
    let activeInvestment = 0;
    const grossYield = 0;
    const netYield = 0;
    let potentialEquity = 0;
    //
    investments.forEach((investment) => {
      const amount = investment.purchasePrice;
      const isActive = investment.transactionType === "Deposit" && investment.status === "completed"; // Assuming you have a property to check if the investment is active
      // const roi =
      //   ((investment.investmentOpportunity.amount - investment.investmentOpportunity.oldAmount) /
      //     investment.investmentOpportunity.amount) *
      //   100;
      // const feesAndExpenses = investment.investmentOpportunity.feesAndExpenses;
      // You may need to calculate this based on your requirements
      const growthRate = investment.investmentOpportunity.growthRate ?? 0;
      // Assuming you have a growthRate property
      //
      totalInvestment += investment.totalInvestment;
      //
      if (isActive) {
        activeInvestment += 1;
      }
      //
      // grossYield += roi;
      // netYield += roi - feesAndExpenses;
      //
      //   // Calculate potential equity using the future value formula: FV = PV * (1 + r)^n
      //   // where PV is the present value, r is the growth rate, and n is the number of periods (e.g., years)
      const futureValue = amount * Math.pow(1 + growthRate, 1); // Assuming a one-year period
      potentialEquity += futureValue;
    });

    return {
      totalInvestment,
      activeInvestment,
      grossYield,
      netYield,
      potentialEquity,
    };
  }
}
