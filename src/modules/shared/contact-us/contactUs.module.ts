import { ContactUsController } from "./contactUs.controller";
import { ContactUsService } from "./contactUs.service";

export class ContactUsModule {
  readonly contactUsService: ContactUsService;
  readonly contactUsController: ContactUsController;

  constructor() {
    this.contactUsService = new ContactUsService();
    this.contactUsController = new ContactUsController(this.contactUsService);
  }
}
