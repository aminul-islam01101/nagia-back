import { type ContactUsSchema } from "@modules/shared/contact-us/contactUs.schema";
import { contactus } from "@utils/sendgrid";

export class ContactUsService {
 async save(contact: ContactUsSchema): Promise<void> {
     await contactus(contact); 
  } 
}
