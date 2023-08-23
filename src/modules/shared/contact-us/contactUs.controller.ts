import handleResponse from "@utils/appResponse";
import type { Response, Request } from "express";
import httpStatus from "http-status";
import { ContactUs } from "./contactUs.schema";
import { type ContactUsService } from "./contactUs.service";

export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  async save(req: Request, res: Response): Promise<void> {
    const passed = await ContactUs.safeParseAsync(req.body);
    if (passed.success) {
      await this.contactUsService.save(passed.data);
      handleResponse(res, httpStatus.OK, "Message sent successfully", true, {});
      return;
    }
    handleResponse(res, httpStatus.BAD_REQUEST, "validation error", false, {
      error: passed.error,
    });
  }
}
