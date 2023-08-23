export const emails = {
  info: "Nagaiagrotrade@gmail.com",
  admin: "Nagaiagrotrade@gmail.com",
  noReply: "no-reply@nagaing.com",
  support: "support@nagaing.com",
};

export const insuranceEmails = ["e-abdulmalik@leadway.com", "e-abiyere@leadway.com", "s-okunrintemi@leadway.com"];

const allUrls: Record<string, string> = {
  production: process.env.LIVE_PROD_BASE_URL as string,
  staging: process.env.LIVE_STAGING_BASE_URL as string,
  development: process.env.LIVE_BASE_URL as string,
};
export const baseUrl: string = allUrls[process.env.NODE_ENV as string];
