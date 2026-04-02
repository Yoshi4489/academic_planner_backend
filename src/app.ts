import express, { urlencoded } from "express";
import cors from "cors";
import router from "./routes/routes.js";

const app = express();

app.use(express.json());

app.use(urlencoded({ extended: true }));

app.use(cors());

app.get("/", (req: express.Request, res: express.Response) => {
  res.send("Hello World!");
});

app.use("/api/v1", router);

export default app;
