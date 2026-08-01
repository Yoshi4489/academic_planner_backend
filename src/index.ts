import "dotenv/config";
import { env } from "./config/env.js";
import app from "./app.js";
import logger from "./config/logger.js";

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`Listening on port ${PORT}`);
});
