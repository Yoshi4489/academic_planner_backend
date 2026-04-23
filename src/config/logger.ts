import winston from "winston";

const { combine, timestamp, errors, colorize, printf } = winston.format;

const customFormat = printf(({ level, message, timestamp, stack }) => {
  const base = `${timestamp} [${level}]: ${message}`;
  return stack ? `${base}\n${stack}` : base;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "http",
  format: combine(
    colorize({ all: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    customFormat
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
