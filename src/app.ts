import express, { type Application, type NextFunction, type Request, type Response } from "express";
import requestLogger from "@middlewares/morgan.middleware";
// import csrf from "tiny-csrf";
import helmet from "helmet";
import cors from "cors";
import xss from "xss-clean";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { AppError, NotFoundError } from "@error/api.error";
import errorHandler from "@error/error.handler";
import { type ErrorObject } from "@interfaces/basic.types";
import options from "@utils/doc";
// import { randomUUID } from "crypto";
import userRoutes from "@modules/user/index.route";
import adminRoutes from "@modules/admin/index.route"
import sharedRoutes from "@modules/shared/index"
import cookieParser from "cookie-parser";
import { config } from "dotenv";

require("express-async-errors");

config();

const app: Application = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("trust proxy", true);
app.set('view engine', 'ejs')

app.use(cookieParser());
// app.use(csrf(randomUUID().slice(0, 32)));
app.use(requestLogger);
app.use(helmet());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); 
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(cors());
app.use(xss());

const specs = swaggerJsdoc(options);

app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("/api/v1/admin", adminRoutes)
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/", sharedRoutes)
app.get("/", (_req, res) => {
  res.send("<a href='/api/v1/api-docs'>go to api docs</a>");
});

// routes don't match, return not found
app.use("*", (_req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError());
});

// handle other app errors
app.use((err: ErrorObject, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  errorHandler(err, req, res, next);
});

export default app;
