import winston from "winston";

import { config } from "../configs/config";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const isProd = config.NODE_ENV === "production";
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
    return stack
        ? `${timestamp} [${level}]: ${message}\n${stack}`
        : `${timestamp} [${level}]: ${message}`;
});

export const logger = winston.createLogger({
    level: isProd ? "info" : "debug",
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        isProd ? json() : colorize(),
    ),
    transports: [
        new winston.transports.Console({
            format: isProd ? json() : combine(colorize(), consoleFormat),
        }),
        ...(isProd
            ? [
                  new winston.transports.File({
                      filename: "logs/error.log",
                      level: "error",
                  }),
                  new winston.transports.File({
                      filename: "logs/combined.log",
                  }),
              ]
            : []),
    ],
});
