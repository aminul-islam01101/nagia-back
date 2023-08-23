import { randomUUID } from "crypto";
import redisClient from "./redis.helper";
import * as Sib from "sib-api-v3-sdk";
import { type ContactUsSchema } from "@modules/shared/contact-us/contactUs.schema";
import ejsTemplate from "./sendMail";
import viewRoutes from "@views/viewRoute";
import { emails, baseUrl } from "@utils/constants" 

const client = Sib.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.SIB_API_KEY ?? "";

export const emailApi = new Sib.TransactionalEmailsApi();

const sendVerificationEmail = async (email: string, link: string, title: string, name: string): Promise<void> => {
  const html = await ejsTemplate(viewRoutes.signUpVerification, {
    title,
    link,
    name,
  });
  const msg = {
    to: [{ email }],
    sender: { email: emails.info },
    subject: title,
    htmlContent: html,
  };

  try {
    const sent = await emailApi.sendTransacEmail(msg);
    return sent;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};
export const sendPaymentConfirmationEmail = async (email: string,  title: string, name: string): Promise<void> => {
  const html = await ejsTemplate(viewRoutes.paymentConfirmation, {
    title,
   
    name,
  });
  const msg = {
    to: [{ email }],
    sender: { email: emails.info },
    subject: title,
    htmlContent: html,
  };

  try {
    const sent = await emailApi.sendTransacEmail(msg);
    return sent;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export async function sendMailToAnyone(
  from: string,
  to: string | string[],
  content: string,
  subject: string,
  heading: string
): Promise<void> {
  const html = await ejsTemplate(viewRoutes.anyone, {
    title: subject,
    content,
    heading,
  });
  const msg = {
    to: Array.isArray(to) ? to.map((email) => ({ email })) : [{ email: to }],
    sender: { email: from },
    subject,
    htmlContent: html,
  };
  try {
    const sent = await emailApi.sendTransacEmail(msg);
    return sent;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
}

export const contactus = async (data: ContactUsSchema): Promise<void> => {
  const html = await ejsTemplate(viewRoutes.contactUs, {
    title: "Contact Us",
    fullname: data.fullname,
    phoneNumber: data.phoneNumber,
    message: data.message,
  });
  const msg = {
    to: [{ email: emails.info }],
    sender: { email: data.email },
    subject: "Contact Us",
    htmlContent: html,
  };
  try {
    const sent = await emailApi.sendTransacEmail(msg);
    return sent;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const sendMail = async (emails_: string[], subject: string, content: string): Promise<void> => {
  const html = await ejsTemplate(viewRoutes.mail, {
    title: subject,
    content,
  });
  const msg = {
    to: emails_.map((email) => ({ email })),
    sender: { email: emails.info },
    subject,
    htmlContent: html,
  };
  try {
    const sent = await emailApi.sendTransacEmail(msg);
    return sent;
  } catch (error: any) {
    throw new Error(error);
  }
};

export async function emailVerificationSetup(
  email: string,
  subLink: string
): Promise<{ receiver: string; link: string }> {
  // THIS IS TO GENERATE VERIFICATION LINK
  const token = randomUUID();
  const emailKey = `${String(process.env.REDIS_PREFIX)}-${token}`;
  const mainurl = `${baseUrl}${subLink}${token}`;
  await redisClient.set(emailKey, email, {
    EX: 3 * 24 * 60 * 60,
    NX: true,
  });

  const receiver = email;
  const link = mainurl;

  return { receiver, link };
}

export async function resetPasswordMail(email: string, name: string): Promise<void> {
  const token = randomUUID();
  const emailKey = `${String(process.env.REDIS_PREFIX)}-${token}`;
  const mainurl = `${baseUrl}/resetpassword/${token}`;
  await redisClient.set(emailKey, email, {
    EX: 3 * 24 * 60 * 60,
    NX: true,
  });

  const html = await ejsTemplate(viewRoutes.resetPassword, {
    title: "Reset Password",
    mainurl,
    name,
  });
  const msg = {
    to: [{ email }],
    sender: { email: emails.info },
    subject: "Reset Password",
    htmlContent: html,
  };
  try {
    const sent = await emailApi.sendTransacEmail(msg);
    return sent;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
}

export default sendVerificationEmail;
