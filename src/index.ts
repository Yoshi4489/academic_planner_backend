import app from "./app.js";
import dotenv from "dotenv";
import logger from "./config/logger.js";

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  logger.info(`Listening on port ${PORT}`);
});
