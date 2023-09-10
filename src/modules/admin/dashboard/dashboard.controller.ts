/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import handleResponse from "@utils/appResponse";
import validator from "validator";
import type { Request, Response } from "express";
import httpStatus from "http-status";
import {
  AdminSendEmail,
  InvestmentNews,
  InvestmentOpportunities,
  NewsIdParams,
  OpportunityIdParams,
  VerifyUserPayment,
} from "./dashboard.schema";
import type { DashboardService } from "./dashboard.service";
import { sendMail, sendMailToAnyone, sendPaymentConfirmationEmail } from "@utils/sendgrid";
import type { AuthRequest } from "@interfaces/basic.types";
import { ValidCUID } from "@modules/user/dashboard/dashboard.schema";
import type { NotificationService } from "@modules/user/notification/notification.service";
import { emails, insuranceEmails } from "@utils/constants";

export class DashboardController {
  constructor(readonly dashboardService: DashboardService, private readonly notificationService: NotificationService) {}

  async getUsers(req: Request, res: Response): Promise<void> {
    const { page, limit } = req.query;

    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 25;

    // Validate user input
    if (pageNumber < 1) {
      handleResponse(res, 400, "Invalid page number", false, {
        error: "Page number must be greater than or equal to 1",
      });
      return;
    }

    if (limitNumber < 1 || limitNumber > 100) {
      handleResponse(res, 400, "Invalid limit value", false, {
        error: "Limit must be between 1 and 100",
      });
      return;
    }

    const users = await this.dashboardService.getAllUsers({
      page: pageNumber,
      limit: limitNumber,
    });

    handleResponse(res, 200, "Users retrieved successfully", true, users);
  }

  async sendMailToUsers(req: Request, res: Response): Promise<void> {
    const passed = await AdminSendEmail.safeParseAsync(req.body);
    if (passed.success) {
      const { emails, subject, content } = passed.data;
      await this.dashboardService.sendMailToUsers(emails, subject, content);
      handleResponse(res, 200, "Emails sent successfully", true, {});
      return;
    }
    handleResponse(res, httpStatus.BAD_REQUEST, "validation error", false, {
      error: passed.error,
    });
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    const userId = req.params.id;
    const isValidId = validator.isAlphanumeric(userId);
    if (!isValidId) {
      handleResponse(res, httpStatus.BAD_REQUEST, "Invalid ID", false, {
        error: "The id is not valid",
      });
      return;
    }
    await this.dashboardService.deleteUserById(userId);
    handleResponse(res, 200, "User deleted successfully", true, {});
  }

  async approveTransaction(req: Request, res: Response): Promise<void> {
    const { userInvestmentId, sellProductId, quantity, transactionId } = req.body;
    const user = (req as AuthRequest).user;
    if (user.id === undefined) {
      handleResponse(res, 401, "No user id found", false, {});
      return;
    }
    if (typeof sellProductId !== "string") {
      handleResponse(res, 401, "Invalid transactionId", false, {
        error: "Check the format of the transactionId, it's not a valid string",
      });
      return;
    }
    if (typeof userInvestmentId !== "string") {
      handleResponse(res, 401, "Invalid userInvestmentId", false, {
        error: "Check the format of the userInvestmentId, it's not a valid string",
      });
      return;
    }
    // Implement your logic for approving a transaction
    const approved = await this.dashboardService.approveTransaction(sellProductId, userInvestmentId, quantity, transactionId);
    if (approved !== null) {
      handleResponse(res, 200, "Transaction approved successfully", true, { approved });
      // send confirmation mail

      const product = await this.dashboardService.getUserInvestmenById(userInvestmentId);
      const account = await this.dashboardService.findAccountByIdService(product?.userId as string);
      // if (product === null || account === null) return;
      await this.notificationService.createNotification(product?.userId as string, {
        message: `Product with opportunityId ${product?.investmentOpportunityId as string} has been  sold  `,
      });

      // % mail
      await sendPaymentConfirmationEmail(
        account?.email as string,
        "Sale Approved",
        `Your sale of ${product?.investmentOpportunityId as string} has been approved.`
      );
      // await sendMail(
      //   [account.email],
      //   "Sale Approved",
      //   `Your sale of ${product.investmentOpportunityId} has been approved.`
      // );
      return;
    }
    handleResponse(res, 400, "Transaction unapproved, an error occurred", false, { approved });
  }

  async getAllTransactions(req: Request, res: Response): Promise<void> {
    const { page, limit } = req.query;

    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 25;

    // Validate user input
    if (pageNumber < 1) {
      handleResponse(res, 400, "Invalid page number", false, {
        error: "Page number must be greater than or equal to 1",
      });
      return;
    }

    if (limitNumber < 1 || limitNumber > 100) {
      handleResponse(res, 400, "Invalid limit value", false, {
        error: "Limit must be between 1 and 100",
      });
      return;
    }
    const transactions = await this.dashboardService.getAllTransactions({
      page: String(pageNumber),
      limit: String(limitNumber),
    });
    handleResponse(res, 200, "Transactions retrieved successfully", true, transactions);
  }

  async addInvestmentNews(req: Request, res: Response): Promise<void> {
    const passed = await InvestmentNews.safeParseAsync(req.body);
    if (passed.success) {
      const news = await this.dashboardService.createInvestmentNews(passed.data);

      handleResponse(res, 201, "Investor news added successfully", true, {
        data: news,
      });
      return;
    }
    handleResponse(res, 401, "Invalid data passed", false, {
      error: passed.error,
    });
  }

  async getSellProducts(req: Request, res: Response): Promise<void> {
    const { page, limit } = req.query;

    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 25;

    // Validate user input
    if (pageNumber < 1) {
      handleResponse(res, 400, "Invalid page number", false, {
        error: "Page number must be greater than or equal to 1",
      });
      return;
    }

    if (limitNumber < 1 || limitNumber > 100) {
      handleResponse(res, 400, "Invalid limit value", false, {
        error: "Limit must be between 1 and 100",
      });
      return;
    }

    const sell = await this.dashboardService.getSellProducts({
      page: pageNumber,
      limit: limitNumber,
    });

    handleResponse(res, 200, "News retrieved successfully", true, sell);
  }

  async getAllInvestmentNews(req: Request, res: Response): Promise<void> {
    const { page, limit } = req.query;

    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 25;

    // Validate user input
    if (pageNumber < 1) {
      handleResponse(res, 400, "Invalid page number", false, {
        error: "Page number must be greater than or equal to 1",
      });
      return;
    }

    if (limitNumber < 1 || limitNumber > 100) {
      handleResponse(res, 400, "Invalid limit value", false, {
        error: "Limit must be between 1 and 100",
      });
      return;
    }

    const news = await this.dashboardService.getAllInvestmentNews({
      page: pageNumber,
      limit: limitNumber,
    });

    handleResponse(res, 200, "News retrieved successfully", true, news);
  }

  async getNewsById(req: Request, res: Response): Promise<void> {
    try {
      const parsed = await NewsIdParams.safeParseAsync(req.params);

      if (!parsed.success) {
        handleResponse(res, 400, "Invalid Id parameter", false, {});
        return;
      }

      const news = await this.dashboardService.getNewsById(parsed.data.newsId);
      handleResponse(res, 200, "Found News", true, { news });
    } catch (error) {
      handleResponse(res, 500, "Error occurred", false, { error });
    }
  }

  async updateNews(req: Request, res: Response): Promise<void> {
    const newsId = req.params.id;
    const updatedNews = await this.dashboardService.updateNews(newsId, req.body);

    if (!updatedNews) {
      handleResponse(res, 404, "Not found error", false, { error: "News not found to update" });
      return;
    }

    handleResponse(res, 200, "News updated successfully", true, { updatedNews });
  }

  async deleteNews(req: Request, res: Response): Promise<void> {
    const newsId = req.params.id;
    await this.dashboardService.deleteNews(newsId);
    handleResponse(res, 200, "Investment news deleted successfully", true, {});
  }

  async addInvestmentOpportunity(req: Request, res: Response): Promise<void> {
    const passed = await InvestmentOpportunities.safeParseAsync(req.body);
    if (passed.success) {
      const opportunity = await this.dashboardService.createInvestmentOpportunity(passed.data);
      handleResponse(res, 201, "Investor opportunity added successfully", true, opportunity);
      return;
    }
    handleResponse(res, 401, "Invalid data passed", false, {
      error: passed.error,
    });
  }

  async getAllInvestmentOpportunity(req: Request, res: Response): Promise<void> {
    const { page, limit } = req.query;

    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 25;

    // Validate user input
    if (pageNumber < 1) {
      handleResponse(res, 400, "Invalid page number", false, {
        error: "Page number must be greater than or equal to 1",
      });
      return;
    }

    if (limitNumber < 1 || limitNumber > 100) {
      handleResponse(res, 400, "Invalid limit value", false, {
        error: "Limit must be between 1 and 100",
      });
      return;
    }

    const opportunity = await this.dashboardService.getAllInvestmentOpportunities({
      page: pageNumber,
      limit: limitNumber,
    });

    handleResponse(res, 200, "Opportunity retrieved successfully", true, opportunity);
  }

  async getOpportunityById(req: Request, res: Response): Promise<void> {
    try {
      const parsed = await OpportunityIdParams.safeParseAsync({ opportunityId: req.params.opportunityId });

      if (!parsed.success) {
        handleResponse(res, 400, "Invalid ID parameter", false, { error: parsed.error });
        return;
      }

      const opportunity = await this.dashboardService.getOpportunityById(parsed.data.opportunityId);
      handleResponse(res, 200, "Found Opportunity", true, { opportunity });
    } catch (error) {
      handleResponse(res, 500, "Internal server error", false, { error });
    }
  }

  async updateOpportunity(req: Request, res: Response): Promise<void> {
    const opportunityId = req.params.id;
    // check if the opportunityId exists
    const updatedOpportunity = await this.dashboardService.updateOpportunity(opportunityId, req.body);
    if (!updatedOpportunity) {
      handleResponse(res, 404, "Opportunity not found", false, {});
      return;
    }

    handleResponse(res, 200, "Opportunity updated successfully", true, { updatedOpportunity });
  }

  async deleteOpportunity(req: Request, res: Response): Promise<void> {
    const opportunityId = req.params.id;
    await this.dashboardService.deleteOpportunity(opportunityId);
    handleResponse(res, 200, "Investment opportunity deleted successfully", true, {});
  }

  async getAccountDetails(req: Request, res: Response): Promise<void> {
    const accountId = req.params.accountId;
    const validCuid = await ValidCUID.safeParseAsync({ id: accountId });
    if (!validCuid.success) {
      handleResponse(res, 400, "Invalid accountId", false, { error: validCuid.error });
      return;
    }
    const accountDetails = await this.dashboardService.getAccountDetails(accountId);
    handleResponse(res, 200, "Account details retrieved successfully", true, { data: accountDetails });
  }

  async getPaymentDetails(req: Request, res: Response): Promise<void> {
    const accountId = req.params.accountId;
    const validCuid = await ValidCUID.safeParseAsync({ id: accountId });
    if (!validCuid.success) {
      handleResponse(res, 400, "Invalid accountId", false, {});
      return;
    }
    const paymentDetails = await this.dashboardService.getPaymentDetails(accountId);
    handleResponse(res, 200, "Payment details retrieved successfully", true, { data: paymentDetails });
  }

  async verifyUserPayment(req: Request, res: Response): Promise<void> {
    const accountId = req.params.accountId;
    const validCuid = await ValidCUID.safeParseAsync({ id: accountId });
    if (!validCuid.success) {
      handleResponse(res, 400, "Invalid accountId", false, {});
      return;
    }
    const parsed = await VerifyUserPayment.safeParseAsync(req.body);
    if (!parsed.success) {
      handleResponse(res, 400, "Bad Request", false, { error: parsed.error });
      return;
    }
    const { userInvestmentId, quantity } = parsed.data;
    const paymentDetails = await this.dashboardService.verifyUserPayment(userInvestmentId, quantity);
    handleResponse(res, 200, "Payment details retrieved successfully", true, { data: paymentDetails });
  }

  async adminBuy(req: Request, res: Response): Promise<void> {
    const bodyData = req.body;
    const {currency,quantity, email: adminEmail,amount,investmentOpportunityId} = bodyData
    const {id: userAccountId,email: userEmail, profile , username} =bodyData.user

    // const validCuid = await ValidCUID.safeParseAsync({ id: accountId });
    // if (!validCuid.success) {
    //   handleResponse(res, 400, "Invalid accountId", false, {});
    //   return;
    // }
    // const parsed = await VerifyUserPayment.safeParseAsync(req.body);
    // if (!parsed.success) {
    //   handleResponse(res, 400, "Bad Request", false, { error: parsed.error });
    //   return;
    // }
    // const { userInvestmentId, quantity } = parsed.data;
    const investment = await this.dashboardService.getInvestmentOpportunityById(investmentOpportunityId);
     await this.dashboardService.adminBuy(quantity,amount,adminEmail,userEmail,userAccountId ,investmentOpportunityId);
     await this.dashboardService.createTransaction(
      "Deposit",
      investmentOpportunityId,
      userAccountId,
      parseInt(amount),
      "Invested"
    );
    await this.notificationService.createNotification(userAccountId as string, {
      message: `Product with opportunityId ${investmentOpportunityId as string} has been  invested  `,
    });

    const user = sendMailToAnyone(
      emails.info,
      userEmail,
      `
            This is confirmation for purchase of 
            product: ${String(investment?.title)}
            with ID: ${String(investment?.id)} purchased on ${new Intl.DateTimeFormat("en-GB", {
        dateStyle: "full",
        timeStyle: "long",
      }).format(new Date())}
  Name - ${username as string} \n 
  Email - ${userEmail as string} \n 
            Phone Number - ${profile.phoneNumber as string} \n
  Amount - ${Number(amount)} \n
You'll get further information from the insurance company on next steps to follow.
`,
      "Buy Product Confirmation",
      "Nagaing"
    );
    handleResponse(res, 200, "Investment done successfully", true, { data: bodyData });
  }

}
 

