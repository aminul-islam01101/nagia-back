import { NotificationService } from "@modules/user/notification/notification.service";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

export class DashboardModule {
  dashboardController: DashboardController;
  dashboardService: DashboardService;
 notificationService: NotificationService;

  constructor() {
    this.dashboardService = new DashboardService();
    this.notificationService = new NotificationService();
    this.dashboardController = new DashboardController(this.dashboardService, this.notificationService);
  }
}
