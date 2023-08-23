import { Router } from "express"
import contactUsRoute from "./contact-us/contactUs.route";

const router = Router();

router.use("/", contactUsRoute)

export default router