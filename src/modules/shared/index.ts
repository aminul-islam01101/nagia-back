/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";
import prisma from "@db/prisma.db";
import contactUsRoute from "./contact-us/contactUs.route";

const router = Router();

router.use("/", contactUsRoute);
router.use("/delete-sell", async function (req, res) {
  try {
    await prisma.sellProduct.deleteMany({});
    res.send("All rows deleted successfully.");
  } catch (error) {
    console.error("Error deleting rows:", error);
  } finally {
    await prisma.$disconnect();
  }
});
router.use("/delete-user-investment", async function (req, res) {
  try {
    await prisma.userInvestment.deleteMany({});
    res.send("All rows deleted successfully.");
  } catch (error) {
    console.error("Error deleting rows:", error);
  } finally {
    await prisma.$disconnect();
  }
});

router.use("/delete-transaction", async function (req, res) {
  try {
    await prisma.transaction.deleteMany({});
    res.send("All rows deleted successfully.");
  } catch (error) {
    console.error("Error deleting rows:", error);
  } finally {
    await prisma.$disconnect();
  }
});

export default router;
