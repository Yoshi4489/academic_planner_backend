import express, {
  urlencoded,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import helmet from "helmet";
import router from "./routes/routes.js";
import createHttpError, { isHttpError } from "http-errors";
import morgan from "morgan";
import logger from "./config/logger.js";
import {
  getAllowedOrigins,
  getTrustProxy,
  isOriginAllowed,
} from "./config/http.js";

const app = express();
const allowedOrigins = getAllowedOrigins();

app.disable("x-powered-by");
app.set("trust proxy", getTrustProxy());

morgan.token("client-ip", (req: Request) => {
  return req.ip || req.socket.remoteAddress || "unknown";
});

app.use(
  morgan(":client-ip :method :url :status :response-time ms", {
    stream: {
      write: (message: string) => logger.http(message.trim()),
    },
  }),
);

app.use(helmet());
app.use(express.json({ limit: "100kb" }));
app.use(urlencoded({ extended: false, limit: "100kb", parameterLimit: 100 }));
app.use(
  cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin, allowedOrigins)) {
        return callback(null, true);
      }

      return callback(createHttpError.Forbidden("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
    maxAge: 600,
  }),
);
app.use("/api/v1", router);
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createHttpError(404, "Route not found"));
});

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (isHttpError(err)) {
    if (err.status >= 500) {
      logger.error(`${err.status} ${err.message}`);
    }
    res.status(err.status).json({ message: err.message });
  } else {
    logger.error(`Unexpected Error: ${err}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default app;
