const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Nagai-Agrotrade Backend API",
      version: "1.0.0",
      description: "API documentation for Nagai-Agrotrade Backend app",
      license: {
        name: "Licensed Under MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "JSONPlaceholder",
        url: "https://jsonplaceholder.typicode.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5005",
        description: "Development server",
      },
      {
        url: "https://staging.api.nagaing.com",
        description: "Staging server",
      },
      {
        url: "https://api.nagaing.com",
        description: "Production server"
      }
    ],
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
            username: {
              type: "string",
            },
            email: {
              type: "string",
            },
            password: {
              type: "string",
            },
          },
          required: ["id", "username", "email", "password"],
        },
        UpdateUserInfo: {
          type: "object",
          properties: {
            fullname: { type: "string" },
            profileImage: { type: "string" },
          },
        },
        UpdatePassword: {
          type: "object",
          properties: {
            currentPassword: "string",
            newPassword: "string",
          },
        },
        UserSignupRequest: {
          type: "object",
          properties: {
            username: {
              type: "string",
            },
            email: {
              type: "string",
            },
            password: {
              type: "string",
            },
            phoneNumber: {
              type: "string",
            },
          },
          required: ["username", "email", "password"],
        },
        UserLoginRequest: {
          type: "object",
          properties: {
            email: {
              type: "string",
            },
            password: {
              type: "string",
            },
          },
          required: ["email", "password"],
        },
        ContactUs: {
          type: "object",
          properties: {
            email: {
              type: "string",
            },
            fullname: {
              type: "string",
            },
            message: {
              type: "string",
            },
            phoneNumber: {
              type: "string",
            },
          },
          required: ["email", "fullname", "message"],
        },
        SellProduct: {
          type: "object",
          properties: {
            investmentId: { type: "string" },
            quantity: { type: "number" },
            bankAccount: { type: "string" },
          },
        },
        BuyProduct: {
          type: "object",
          properties: {
            investmentOpportunityId: { type: "string" },
            quantity: { type: "number" },
            email: { type: "string" },
            amount: { type: "number" },
            currency: { type: "string" },
            paymentMethod: { type: "string" },
          },
        },
        ApproveTransaction: {
          type: "object",
          properties: {
            userInvesmentId: { type: "string" },
            transactionId: { type: "string" },
            quantity: { type: "number" },
          },
        },
        InvestmentNews: {
          type: "object",
          properties: {
            title: {
              type: "string",
            },
            description: {
              type: "string",
            },
            link: {
              type: "string",
            },
            source: {
              type: "string",
            },
            image: {
              type: "string",
            },
          },
        },
        InvestmentOpportunities: {
          type: "object",
          properties: {
            title: {
              type: "string",
            },
            amount: {
              type: "number",
            },
            image: {
              type: "string",
            },
            oldAmount: { type: "number" },
            growthRate: { type: "number" },
          },
        },
        AccountDetails: {
          type: "object",
          properties: {
            bankName: { type: "string" },
            accountNumber: { type: "string" },
            accountHolderName: { type: "string" },
            userId: { type: "string" },
          },
        },
        PaymentDetails: {
          type: "object",
          properties: {
            cardHolderName: { type: "string" },
            cardNumber: { type: "string" },
            expiryMonth: { type: "number" },
            expiryYear: { type: "number" },
            cvv: { type: "number" },
            userId: { type: "number" },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
            },
            message: {
              type: "string",
            },
            data: {
              type: "object",
            },
          },
          required: ["message"],
        },
        ErrorResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
            },
            message: {
              type: "string",
            },
            error: {
              type: "string",
            },
          },
          required: ["error"],
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    "src/modules/user/user.route.ts",
    "src/modules/shared/contact-us/contactUs.route.ts",
    "src/modules/admin/admin.route.ts",
    "src/modules/admin/dashboard/dashboard.route.ts",
    "src/modules/user/dashboard/dashboard.route.ts",
    "src/modules/user/notification/notification.route.ts",
  ],
};

export default options;
