/* eslint-disable @typescript-eslint/no-unused-vars */
import path from "node:path";

import express, { NextFunction, Request, Response } from "express";
import fileUpload from "express-fileupload";
import * as mongoose from "mongoose";

import { config } from "./configs/config";
import { runnerCrones } from "./cron";
import { ApiError } from "./errors/api.error";
import { logger } from "./logger/logger";
import { apiRouter } from "./routers/api.router";
import { seedBrands } from "./seeds/brand.seed";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use("/media", express.static(path.join(process.cwd(), "upload")));
app.use("/", apiRouter);

app.use((err: ApiError, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
    const message = err.message ?? "Something went wrong";
    res.status(status).json({ status, message });
});

process.on("uncaughtException", (error) => {
    logger.error("uncaughtException", error);
    process.exit(1);
});

const port = config.PORT || 7000;
const mongoDb = config.MONGO_URI;

const dbConnection = async () => {
    let dbCon = false;

    while (!dbCon) {
        try {
            logger.info("Connecting to DB...");

            await mongoose.connect(mongoDb);
            dbCon = true;
            logger.info("Database available!!!");
            await seedBrands();
        } catch (e) {
            logger.info("Database unavailable, wait 3 seconds");
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
    }
};

const start = async () => {
    try {
        await dbConnection();
        app.listen(port, () => {
            logger.info(`Server listening on port ${port}`);
            runnerCrones();
        });
    } catch (e) {
        logger.info(e.message);
    }
};
start();
