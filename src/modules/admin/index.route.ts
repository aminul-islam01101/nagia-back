import { Router } from "express";
import adminRoute from "./admin.route";
import dashboardRoute from "./dashboard/dashboard.route"
const router = Router();

router.use("/account", adminRoute);
router.use("/dashboard", dashboardRoute)

export default router;
