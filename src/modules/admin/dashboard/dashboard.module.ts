import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

export class DashboardModule {
  dashboardController: DashboardController;
  dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
    this.dashboardController = new DashboardController(this.dashboardService);
  }
}
