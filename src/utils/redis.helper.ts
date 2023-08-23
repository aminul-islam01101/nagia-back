import logger from "../middlewares/winston.middleware";
import chalk from "chalk";
import { createClient } from "redis";

const redisClient = createClient();
redisClient.on("error", (error) => logger.error(chalk.bold.red("Error: "), error));
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    logger.error(chalk.bold.red("Error: "), err);
  }
})()
  .then(() => logger.info("redis connected"))
  .catch((err) => logger.error(chalk.bold.red("Error: "), err));

export default redisClient;
