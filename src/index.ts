import app from "./app.js";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
