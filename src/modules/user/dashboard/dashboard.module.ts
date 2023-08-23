import { NotificationService } from "../notification/notification.service";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

export class DashboardModule {
  readonly dashboardService: DashboardService;
  readonly dashboardController: DashboardController;
  readonly notificationService: NotificationService;

  constructor() {
    this.dashboardService = new DashboardService();
    this.notificationService = new NotificationService();
    this.dashboardController = new DashboardController(this.dashboardService, this.notificationService);
  }
}
