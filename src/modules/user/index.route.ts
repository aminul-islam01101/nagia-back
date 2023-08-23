import { Router } from "express";
import userRouter from "./user.route";
import dashboardRouter from "./dashboard/dashboard.route"
import notificationRouter from "./notification/notification.route"

const router = Router();

router.use("/account", userRouter);
router.use("/dashboard", dashboardRouter)
// router.use("history")
// router.use("market")
// router.use("portfolio")
// router.use("settings")
router.use("/notifications", notificationRouter)

export default router;
