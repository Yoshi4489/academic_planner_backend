import express, {
  urlencoded,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import router from "./routes/routes.js";
import createHttpError, { isHttpError } from "http-errors";
import morgan from "morgan";
import logger from "./config/logger.js";

const app = express();

app.set("trust proxy", true);

morgan.token("client-ip", (req: Request) => {
  return (
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown"
  );
});

app.use(
  morgan(":client-ip :method :url :status :response-time ms", {
    stream: {
      write: (message: string) => logger.http(message.trim()),
    },
  })
);

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cors());
app.use("/api/v1", router);
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createHttpError(404, `Route not found`));
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
