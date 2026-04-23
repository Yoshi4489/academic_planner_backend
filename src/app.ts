import express, {
  urlencoded,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import router from "./routes/routes.js";
import { isHttpError } from "http-errors";
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

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (isHttpError(err)) {
    res.status(err.status).json({ message: err.message });
  } else {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default app;
