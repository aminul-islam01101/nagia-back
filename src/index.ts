/* eslint-disable @typescript-eslint/restrict-template-expressions */
import "@total-typescript/ts-reset";
import cluster, { type Worker } from "cluster";
import os from "os";
import app from "./app";
import logger from "./middlewares/winston.middleware";

const numCpus = 2 ?? os.cpus().length;
const port = process.env.PORT ?? 5005;

if (cluster.isPrimary) {
  for (let i = 0; i < numCpus; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker: Worker, code: number | null, signal: string | null) => {
    logger.error(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
    logger.info("Starting a new worker...");
    cluster.fork();
  });
} else {
  app.listen(port, () => {
    logger.info(`Worker ${process.pid} listening on port ${port}...`);
  });

  process.on("uncaughtException", (err: Error) => {
    logger.error(`Uncaught exception: ${err.message}`);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason: unknown) => {
    logger.error(`Unhandled rejection: ${reason}`);
    process.exit(1);
  });
}
