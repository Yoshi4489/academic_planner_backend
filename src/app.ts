import express, {
  urlencoded,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import router from "./routes/routes.js";
import { isHttpError } from "http-errors";

const app = express();

app.use(express.json());

app.use(urlencoded({ extended: true }));

app.use(cors());

app.get("/", (req: express.Request, res: express.Response) => {
  res.send("Hello World!");
});

app.use("/api/v1", router);

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (isHttpError(err)) {
    res.status(err.status).json({ message: err.message });
  } else {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default app;
