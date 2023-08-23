/* eslint-disable @typescript-eslint/restrict-template-expressions */
import morgan from "morgan";
import logger from "./winston.middleware";

const requestLogger = morgan(
  (tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      `${tokens["response-time"](req, res)}ms`,
      `- ${tokens.res(req, res, "content-length") ?? "-"}`,
    ].join(" ");
  },
  {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }
);

export default requestLogger;
