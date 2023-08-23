import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

export class AdminModule {
  readonly adminService: AdminService;
  readonly adminController: AdminController;

  constructor() {
    this.adminService = new AdminService();
    this.adminController = new AdminController(this.adminService);
  }
}
