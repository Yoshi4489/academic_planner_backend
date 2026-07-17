import "dotenv/config";
import app from "./app.js";
import logger from "./config/logger.js";

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  logger.info(`Listening on port ${PORT}`);
});