/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import path from "node:path";

import express, { NextFunction, Request, Response } from "express";
import * as mongoose from "mongoose";

import { config } from "./configs/config";
import { ApiError } from "./errors/api.error";
import { apiRouter } from "./routers/api.router";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/media", express.static(path.join(process.cwd(), "upload")));
app.use("/", apiRouter);

app.use((err: ApiError, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || 500;
    const message = err.message ?? "Something went wrong";
    res.status(status).json({ status, message });
});

process.on("uncaughtException", (error) => {
    console.log("uncaughtException", error);
    process.exit(1);
});

const port = config.PORT || 7000;
const mongoDb = config.MONGO_URI;

const dbConnection = async () => {
    let dbCon = false;

    while (!dbCon) {
        try {
            console.log("Connection to DB...");

            await mongoose.connect(mongoDb);
            dbCon = true;
            console.log("Database available!!!");
        } catch (e) {
            console.log("Database unavailable, wait 3 seconds");
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
    }
};

const start = async () => {
    try {
        await dbConnection();
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    } catch (e) {
        console.log(e.message);
    }
};
start();
