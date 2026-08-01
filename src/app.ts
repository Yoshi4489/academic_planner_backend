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
import prisma from "./config/prisma.js";
import { requestIdMiddleware } from "./middleware/middleware.js";
import {
  getAllowedOrigins,
  getTrustProxy,
  isOriginAllowed,
} from "./config/http.js";

const app = express();
const allowedOrigins = getAllowedOrigins();

app.disable("x-powered-by");
app.set("trust proxy", getTrustProxy());
app.use(requestIdMiddleware);

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
    allowedHeaders: ["Authorization", "Content-Type", "Idempotency-Key", "X-Request-ID"],
    maxAge: 600,
  }),
);
app.get("/health/live", (_req, res) => res.status(200).json({ status: "ok" }));
app.get("/health/ready", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ready" });
  } catch {
    res.status(503).json({ status: "unavailable" });
  }
});
app.use("/api/v1", router);
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createHttpError(404, "Route not found"));
});

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  const prismaCode =
    typeof err === "object" && err !== null && "code" in err
      ? String(err.code)
      : undefined;
  if (prismaCode === "P2002") {
    return res.status(409).json({ message: "A record with this value already exists" });
  }
  if (prismaCode === "P2025") {
    return res.status(404).json({ message: "Record not found" });
  }
  if (prismaCode === "P1000" || prismaCode === "P1010") {
    logger.error(`[${req.requestId}] Database authentication or authorization failed`);
    return res.status(503).json({ message: "Database temporarily unavailable" });
  }
  if (isHttpError(err)) {
    if (err.status >= 500) {
      logger.error(`[${req.requestId}] ${err.status} ${err.message}`);
    }
    res.status(err.status).json({ message: err.message });
  } else {
    logger.error(`[${req.requestId}] Unexpected Error: ${err}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default app;
