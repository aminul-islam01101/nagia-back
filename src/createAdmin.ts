import logger from "@middlewares/winston.middleware";
import { User } from "@modules/user/user.schema";
import { AdminService } from "@modules/admin/admin.service";

const email = process.argv[2];
const username = process.argv[3];
const password = process.argv[4];

(async () => {
  try {
    const passed = await User.safeParseAsync({ email, username, password });
    if (passed.success) {
      const { email, password, username } = passed.data;
      logger.info(`Creating admin account with ${email}, ${username}, ${password}`);
      const adminService = new AdminService();
      const foundUsername = await adminService.findByUsernameService(username);
      if (foundUsername !== null) return logger.info("User already exists");

      const foundEmail = await adminService.findByEmailService(email);
      if (foundEmail !== null) return logger.info("Email already exists");
      const created = await adminService.createAdminAccount({ email, username, password });
      logger.info(`Admin created successfully ${created.email}`);
    }
  } catch (error) {
    logger.error("Failed to create admin account:", error);
    process.exit(1);
  }
})().catch((err) => logger.error(err));

