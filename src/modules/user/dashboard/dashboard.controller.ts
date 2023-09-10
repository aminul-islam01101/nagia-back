import type { Request, Response } from "express";
import type { DashboardService } from "./dashboard.service";
import handleResponse from "@utils/appResponse";
import {
  AccountDetailsSchema,
  BuyProductSchema,
  PaginationParams,
  PaymentDetailsSchema,
  SellProductSchema,
  UpdatePasswordSchema,
  UpdateUserInfoSchema,
  ValidCUID,
} from "./dashboard.schema";
import type { AuthRequest } from "@interfaces/basic.types";
import { flutterwaveInstance, paystackInstance } from "@utils/payment.helper";
import validator from "validator";
import { BAD_REQUEST } from "http-status";
import { checkPassword, hashPassword } from "@utils/hash.helper";
import crypto from "crypto";
import flwApi from "@utils/flw.axios";
import type { NotificationService } from "../notification/notification.service";
import { OpportunityIdParams } from "@modules/admin/dashboard/dashboard.schema";
import sendVerificationEmail, {
  emailVerificationSetup,
  sendMailToAnyone,
  sendPaymentConfirmationEmail,
} from "@utils/sendgrid";
import { emails, insuranceEmails } from "@utils/constants";

export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly notificationService: NotificationService
  ) {}

  async getNews(req: Request, res: Response): Promise<void> {
    const parsed = await PaginationParams.safeParseAsync(req.query);

    if (!parsed.success) {
      handleResponse(res, 400, "Invalid query parameters", false, {
        error: parsed.error,
      });
      return;
    }

    const news = await this.dashboardService.getNews(parsed.data);
    handleResponse(res, 200, "News retrieved successfully", true, news);
  }

  async getOpportunity(req: Request, res: Response): Promise<void> {
    const parsed = await PaginationParams.safeParseAsync(req.query);

    if (!parsed.success) {
      handleResponse(res, 400, "Invalid query parameters", false, {
        error: parsed.error,
      });
      return;
    }

    const opportunity = await this.dashboardService.getOpportunity(parsed.data);
    handleResponse(res, 200, "Opportunity retrieved successfully", true, opportunity);
  }

  async getOpportunityTitles(req: Request, res: Response): Promise<void> {
    const opportunities = await this.dashboardService.getOpportunityTittles();
    handleResponse(res, 200, "Opportunities retrieved successfully", true, opportunities);
  }

  async getOpportunityById(req: Request, res: Response): Promise<void> {
    try {
      const parsed = await OpportunityIdParams.safeParseAsync({ opportunityId: req.params.id });

      if (!parsed.success) {
        handleResponse(res, 400, "Invalid ID parameter", false, { error: parsed.error });
        return;
      }

      const opportunity = await this.dashboardService.getInvestmentOpportunityById(parsed.data.opportunityId);
      handleResponse(res, 200, "Found Opportunity", true, { opportunity });
    } catch (error) {
      handleResponse(res, 500, "Internal server error", false, { error });
    }
  }

  //! buy product
  async buyProduct(req: Request, res: Response): Promise<void> {
    if ((req as AuthRequest).user === undefined) {
      handleResponse(res, 401, "Not logged in or unauthorized", false, {});
      return;
    }
    const userId = (req as AuthRequest).user.id;
    if (userId === undefined) {
      handleResponse(res, 401, "UserId not found, check that you're logged in", false, {});
      return;
    }

    const passed = await BuyProductSchema.safeParseAsync(req.body);
    if (passed.success) {
      const { investmentOpportunityId, quantity, amount, currency, paymentMethod, email } = passed.data;

      const isValidEmail = validator.isEmail(email);
      if (!isValidEmail) {
        handleResponse(res, BAD_REQUEST, `Email is invalid ${email}`, false, {});
        return;
      }

      const investmentOpportunity = await this.dashboardService.getInvestmentOpportunityById(investmentOpportunityId);

      if (investmentOpportunity === null) {
        handleResponse(res, 404, `No investment opportunity for this ${investmentOpportunityId} found`, false, {});
        return;
      }
      let transactionResult;
      // investor pays 1500 per bag for storage for one year
      if (paymentMethod === "paystack") {
        transactionResult = await paystackInstance.transaction.initialize({
          amount /*  quantity * 100 * 1500 */, // Paystack expects the amount in kobo (1 Naira = 100 kobo)
          email,
          currency,
          metadata: {
            product_id: investmentOpportunityId,
            quantity,
            amount,
            email,
          },
        });
      } else if (paymentMethod === "flutterwave") {
        const response = await flwApi.post("/payments", {
          tx_ref: crypto.randomUUID(),
          amount,
          currency: "NGN",
          redirect_url: "https://nagaing.com/flutterwave/callback",
          meta: {
            product_id: investmentOpportunityId,
            quantity,
            email,
            amount,
          },
          customer: {
            email,
          },
        });
        transactionResult =
          response.data.status === "success"
            ? {
                ...response.data,
                status: true,
              }
            : {
                ...response.data,
                status: false,
              };
      } else {
        handleResponse(res, 400, "Invalid payment method", false, {});
        return;
      }
      if (transactionResult.status === true) {
        // const { receiver, link } = await emailVerificationSetup(email, "/api/v1/user/account/verify/");
        // await sendPaymentConfirmationEmail(
        //   email,
        //   "Payment confirmation email",
        //   `Congratulations. You have successfully done your transaction. Your transaction reference id is ${transactionResult.data.reference as string}`
        // );

        const products = await this.dashboardService.buyProduct(
          userId,
          investmentOpportunityId,
          investmentOpportunity,
          quantity
        );
        await this.notificationService.createNotification(userId, {
          message: `Acknowledged, please wait for payment confirmation to get your product ${investmentOpportunityId}`,
        });
        handleResponse(res, 200, "Acknowledged, please wait for payment confirmation to get your product", true, {
          transactionResult,
          products,
        });
      } else {
        handleResponse(res, 400, "Transaction failed", false, { transactionResult });
      }
      return;
    }
    handleResponse(res, 400, "Invalid data passed", false, { error: passed.error });
  }
  //! pay stack call back

  async handlePaystackCallback(req: Request, res: Response): Promise<void> {
    const { reference, userInvestmentId, checkoutId } = req.query;
    if ((req as AuthRequest).user === undefined) {
      handleResponse(res, 401, "Not logged in or unauthorized", false, {});
      return;
    }
    if (typeof checkoutId !== "string") {
      handleResponse(res, 401, "Invalid checkoutid", false, {});
      return;
    }
    const userId = (req as AuthRequest).user.id;
    if (userId === undefined) {
      handleResponse(res, 401, "UserId not found, check that you're logged in", false, {});
      return;
    }
    // get checkout info by the id
    const checkoutInfo = await this.dashboardService.getInfoFromCheckout(checkoutId);
    if (typeof reference !== "string") {
      handleResponse(res, 400, "reference is not a string", false, {});
      return;
    }
    if (typeof userInvestmentId !== "string") {
      handleResponse(res, 400, "userInvestmentId is not a valid cuid", false, {});
      return;
    }
    const verified = await paystackInstance.transaction.verify({ reference });
    const userInvestment = await this.dashboardService.getUserInvestmentById(userInvestmentId);
    if (verified.status === true) {
      if (userInvestment.verified) {
        handleResponse(res, 403, "Already verified", false, {});
        return;
      }
      const investmentOpportunityId = verified.data.metadata.product_id;
      const quantity = verified.data.metadata.quantity;
      const amount = verified.data.metadata.amount;
      const investment = await this.dashboardService.getInvestmentOpportunityById(investmentOpportunityId);
      // reduce the quantity
      await this.dashboardService.updateInvestmentOpportunity(userInvestmentId, false, parseInt(quantity));
      await this.dashboardService.createTransaction(
        "Deposit",
        investmentOpportunityId,
        userId,
        parseInt(verified.data.metadata.amount),
        "Invested"
      );
      if (checkoutInfo === null) {
        handleResponse(res, 400, "Can't find your checkout info", false, {
          error: "Email won't be sent",
        });
        return;
      }
      const user = sendMailToAnyone(
        emails.info,
        checkoutInfo.email,
        `
              This is confirmation for purchase of 
              product: ${String(investment?.title)}
              with ID: ${String(investment?.id)} purchased on ${new Intl.DateTimeFormat("en-GB", {
          dateStyle: "full",
          timeStyle: "long",
        }).format(new Date())}
    Name - ${checkoutInfo.name} \n 
    Email - ${checkoutInfo.email} \n 
              Phone Number - ${checkoutInfo.phoneNumber} \n
    Amount - ${Number(amount)} \n
You'll get further information from the insurance company on next steps to follow.
`,
        "Buy Product Confirmation",
        "Nagaing"
      );
      // to admin
      const admin = sendMailToAnyone(
        emails.info,
        emails.info,
        `This product: ${String(investment?.title)} was bought by: ${String(checkoutInfo.email)} /n
    Name - ${checkoutInfo.name}, email: ${checkoutInfo.email}, phone number: ${checkoutInfo.phoneNumber}
        `,
        "Buy Product Confirmation",
        "Nagaing"
      );
      // to insurance company
      const insurance = sendMailToAnyone(
        emails.info,
        insuranceEmails,
        `Purchase of product ${String(investment?.title)} was made by
    Name - ${checkoutInfo.name}, email: ${checkoutInfo.email}, phone number: ${
          checkoutInfo.phoneNumber
        }, amount - ${Number(amount)}
    `,
        "Nagaing Investor Product Buy Confirmation",
        "Nagaing (Insurance)"
      );

      await Promise.allSettled([user, admin, insurance]);
      handleResponse(res, 200, "Payment confirmed", true, { verified });
      return;
    }
    await this.dashboardService.updateInvestmentOpportunity(userInvestmentId, true,);
    handleResponse(res, 400, "Payment was unsuccessful", false, { verified });
  }

  async handleFlwCallback(req: Request, res: Response): Promise<void> {
    if ((req as AuthRequest).user === undefined) {
      handleResponse(res, 401, "Not logged in or unauthorized", false, {});
      return;
    }
    const userId = (req as AuthRequest).user.id;
    if (userId === undefined) {
      handleResponse(res, 401, "UserId not found, check that you're logged in", false, {});
      return;
    }
    if (req.query.status === "successful") {
      const { userInvestmentId, checkoutId } = req.query;
      if (typeof userInvestmentId !== "string") {
        handleResponse(res, 400, "userInvestmentId is not a valid cuid", false, {});
        return;
      }
      if (typeof checkoutId !== "string") {
        handleResponse(res, 401, "Invalid checkoutid", false, {});
        return;
      }
      // get checkoutinfo by hte id
      const checkoutInfo = await this.dashboardService.getInfoFromCheckout(checkoutId);
      const transactionDetails = await flutterwaveInstance.Transaction.find({ ref: req.query.tx_ref });
      const response = await flutterwaveInstance.Transaction.verify({ id: req.query.transaction_id });
      if (
        response.data.status === "successful" &&
        response.data.amount === transactionDetails.amount &&
        response.data.currency === "NGN"
      ) {
        // Success! Confirm the customer's payment
        const investmentOpportunityId = response.data.meta.product_id;
        const quantity = response.data.meta.quantity;
        // reduce the quantity
        await this.dashboardService.updateInvestmentOpportunity(userInvestmentId, false, parseInt(quantity));
        await this.dashboardService.createTransaction(
          "Deposit",
          investmentOpportunityId,
          userId,
          response.data.amount,
          "Invested"
        );
        handleResponse(res, 200, "Payment confirmed", true, { data: response.data });
      } else {
        // Inform the customer their payment was unsuccessful and fail the transaction
        await this.dashboardService.updateInvestmentOpportunity(userInvestmentId, true);
        handleResponse(res, 400, "Payment was unsuccessful", false, {});
      }
    }
  }

  //! sell product
  async sellProduct(req: Request, res: Response): Promise<void> {
    if ((req as AuthRequest).user === undefined) {
      handleResponse(res, 401, "Not logged in or unauthorized", false, {});
      return;
    }
    const userId = (req as AuthRequest).user.id;
    if (userId === undefined) {
      handleResponse(res, 401, "UserId not found, check that you're logged in", false, {});
      return;
    }

    // % user info
    const userInfo = await this.dashboardService.getUserById(userId);
    const passed = await SellProductSchema.safeParseAsync(req.body);
    if (passed.success) {
      const { investmentOpportunityId, quantity, phoneNumber } = passed.data;

      // % product / opportunity
      const opportunity = await this.dashboardService.getInvestmentOpportunityById(investmentOpportunityId);
      // % user Investment
      const userInvestment = await this.dashboardService.getUserInvestmentByOpportunity(
        userId,
        investmentOpportunityId
      );
      if (userInvestment === null) {
        handleResponse(res, 404, "User has no investment in this opportunity", false, {});
        return;
      }

      if (quantity > userInvestment.quantity) {
        handleResponse(res, 400, "Cannot sell more than the available quantity", false, {});
        return;
      }

      const amount = userInvestment.purchasePrice * quantity;
       // % transactions
       const newTransaction = await this.dashboardService.createTransaction(
        "Cashout",
        investmentOpportunityId,
        userId,
        amount,
        "Sell Approval Pending"
      );
      // % sell Product
      const waitingForApproval = await this.dashboardService.sellProduct(userInvestment.id, quantity, phoneNumber, );
      if (waitingForApproval !== null) {
        handleResponse(res, 200, "Waiting for approval from admin to get your product sold", true, {
          waitingForApproval,
        });
        

       

        // % notification
        await this.notificationService.createNotification(userId, {
          message: `Product with opportunityId ${investmentOpportunityId} has been initiated to be sold `,
        });
        // % create sell requests
        await this.dashboardService.createSellRequest(
          userInfo?.username as string,
          phoneNumber,
          userInfo?.email as string,
          "Pending",
          opportunity?.title as string,
          quantity,
          amount,
          userId,
          investmentOpportunityId,
          userInvestment.id,
          newTransaction.id
        );
        // % update sell requests quantity
        await this.dashboardService.updateUserInvestmentSellRequestQuantity(userInvestment.id,quantity)
        
        // % mail
        await sendPaymentConfirmationEmail(
          emails.admin,
          "sell confirmation email",
          `There is a sell request from user from

          username: ${userInfo?.username as string},
          Email: ${userInfo?.email as string},
          Phone Number: ${phoneNumber},
          product Name:${opportunity?.title as string},
          quantity: ${quantity}, 
          amount: ${amount} NGN,
          investmentOpportunityId: ${investmentOpportunityId}
          `
        );
        return;
      }
      handleResponse(res, 400, "can't get approval for the product", false, { waitingForApproval });
      return;
    }
    handleResponse(res, 400, "Invalid data passed", false, { error: passed.error });
  }

  async getUserInvestment(req: Request, res: Response): Promise<void> {
    const userId = req.params.id;
    const validCuid = await ValidCUID.safeParseAsync({ id: userId });
    if (!validCuid.success) {
      handleResponse(res, 400, "Invalid userId", false, {});
      return;
    }

    const parsed = await PaginationParams.safeParseAsync(req.query);

    if (!parsed.success) {
      handleResponse(res, 400, "Invalid query parameters", false, {
        error: parsed.error,
      });
      return;
    }

    try {
      const userInvestment = await this.dashboardService.getUserInvestment(userId, parsed.data);
      handleResponse(res, 200, "User investments retrieved successfully", true, {
        data: userInvestment,
      });
    } catch (error) {
      handleResponse(res, 404, "User investments not found", false, {
        error,
      });
    }
  }

  async updatePassword(req: Request, res: Response): Promise<void> {
    const passed = await UpdatePasswordSchema.safeParseAsync(req.body);
    if (passed.success) {
      const { currentPassword, newPassword } = passed.data;
      const username = (req as AuthRequest).user.username;
      if (username === undefined) {
        handleResponse(res, 401, "No username found, check that you're logged in", false, {});
        return;
      }
      const user = await this.dashboardService.getUser(username);
      if (user === null) {
        handleResponse(res, 404, "User not found", false, {});
        return;
      }
      // compare password
      const matches = await checkPassword(currentPassword, user.password);
      if (!matches) {
        handleResponse(res, 403, "Passwords don't match, check that your current password is correct", false, {});
        return;
      }
      if (!("id" in (req as AuthRequest).user)) {
        handleResponse(res, 401, "No id found", false, {});
        return;
      }
      // hash password
      const hashedPwd = await hashPassword(newPassword);
      const updated = await this.dashboardService.updatePassword((req as AuthRequest).user.id as string, hashedPwd);
      if (updated !== null) {
        await this.notificationService.createNotification(user.id, { message: `Password updated successfully` });
        handleResponse(res, 200, "Password updated successfully", true, {});
      } else {
        handleResponse(res, 400, "Current password is incorrect", false, {});
      }
    } else {
      handleResponse(res, 400, "Invalid data passed", false, { error: passed.error });
    }
  }

  async updateUserInfo(req: Request, res: Response): Promise<void> {
    const passed = await UpdateUserInfoSchema.safeParseAsync(req.body);
    if (passed.success) {
      const username = (req as AuthRequest).user.username;
      if (username === undefined) {
        handleResponse(res, 401, "No username found, check that you're logged in", false, {});
        return;
      }
      // if the username already exists don't allow it
      const updatedUser = await this.dashboardService.updateUserInfo(
        (req as AuthRequest).user.id as string,
        passed.data
      );
      handleResponse(res, 200, "User information updated successfully", true, { data: updatedUser });
      await this.notificationService.createNotification(updatedUser.id, {
        message: `User info updated successfully`,
      });
    } else {
      handleResponse(res, 400, "Invalid data passed", false, { error: passed.error });
    }
  }

  async getTransactionHistory(req: Request, res: Response): Promise<void> {
    const userId = (req as AuthRequest).user.id;
    if (userId === undefined) {
      handleResponse(res, 404, "No user id found", false, {});
      return;
    }

    const parsed = await PaginationParams.safeParseAsync(req.query);

    if (!parsed.success) {
      handleResponse(res, 400, "Invalid query parameters", false, {
        error: parsed.error,
      });
      return;
    }
    const transactions = await this.dashboardService.getTransactionHistory(userId, parsed.data);
    handleResponse(res, 200, "Transaction history retrieved successfully", true, { data: transactions });
  }

  async addAccountDetails(req: Request, res: Response): Promise<void> {
    const passed = await AccountDetailsSchema.safeParseAsync(req.body);
   
    if (passed.success) {
      const existData = await this.dashboardService.getExistingAccount(passed.data.bankName, passed.data.accountNumber)
    
      if (existData!== null) {
        handleResponse(res, 409, "account already exist", false, { error: "conflicts" });
        return;
      }
      const accountDetails = await this.dashboardService.addAccountDetails(
        (req as AuthRequest).user.id as string,
        passed.data
      );
     
      handleResponse(res, 201, "Account details added successfully", true, accountDetails);
      await this.notificationService.createNotification((req as AuthRequest).user.id as string, {
        message: `Account details has been added successfully`,
      });
    } else {
      handleResponse(res, 400, "Invalid account details data", false, {
        error: passed.error,
      });
    }
  }

  async updateAccount(req: Request, res: Response): Promise<void> {
    const accountId = req.params.accountId;
    const validCuid = await ValidCUID.safeParseAsync({ id: accountId });
    if (!validCuid.success) {
      handleResponse(res, 400, "Invalid accountId", false, { error: validCuid.error });
      return;
    }
    const passed = await AccountDetailsSchema.safeParseAsync(req.body);


    if (passed.success) {
      const accountDetails = await this.dashboardService.updateAccountDetails(
        accountId ,
        passed.data
      );
    
      handleResponse(res, 201, "Account details updated successfully", true, accountDetails);
      await this.notificationService.createNotification((req as AuthRequest).user.id as string, {
        message: `Account details has been Updated successfully`,
      });
    } else {
      handleResponse(res, 400, "Invalid account details data", false, {
        error: passed.error,
      });
    }
  }

  async deleteAccount(req: Request, res: Response): Promise<void> {
    const accountId = req.params.accountId;
    const validCuid = await ValidCUID.safeParseAsync({ id: accountId });
    if (!validCuid.success) {
      handleResponse(res, 400, "Invalid accountId", false, { error: validCuid.error });
      return;
    }
    await this.dashboardService.deleteAccountById(accountId);
    handleResponse(res, 200, "account deleted successfully", true, {});
  }

  async addPaymentDetails(req: Request, res: Response): Promise<void> {
    const passed = await PaymentDetailsSchema.safeParseAsync(req.body);
    if (passed.success) {
      const paymentDetails = await this.dashboardService.addPaymentDetails(
        (req as AuthRequest).user.id as string,
        passed.data
      );
      handleResponse(res, 201, "Payment details added successfully", true, paymentDetails);
      await this.notificationService.createNotification((req as AuthRequest).user.id as string, {
        message: `Payment details has been added successfully`,
      });
    } else {
      handleResponse(res, 400, "Invalid payment details data", false, {
        error: passed.error,
      });
    }
  }

  async getCheckoutInfo(req: Request, res: Response): Promise<void> {
    const userId = (req as AuthRequest).user.id;
    if (userId === undefined) {
      handleResponse(res, 404, "No user id found", false, {});
      return;
    }
    const checkoutInfo = await this.dashboardService.getCheckoutInfo(userId);
    handleResponse(res, 200, "Checkout info", true, { checkoutInfo });
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

  async getTransactionStats(req: Request, res: Response): Promise<void> {
    const userId = (req as AuthRequest).user.id;
    if (userId === null || userId === undefined) {
      handleResponse(res, 401, "Userid is not defined", false, {});
      return;
    }
    const stats = await this.dashboardService.getTransactionStats(userId);
    handleResponse(res, 200, "Transaction stats", true, { stats });
  }

  async calcInvestmentStats(req: Request, res: Response): Promise<void> {
    const userId = (req as AuthRequest).user.id;
    if (userId === null || userId === undefined) {
      handleResponse(res, 401, "Userid is not defined", false, {});
      return;
    }
    const investmentStats = await this.dashboardService.calculateInvestmentStats(userId);
    handleResponse(res, 200, "Investment stats", true, { investmentStats });
  }
}
