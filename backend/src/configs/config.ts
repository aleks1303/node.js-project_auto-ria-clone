import { ObjectCannedACL } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

interface IConfig {
    PORT: string;
    MONGO_URI: string;

    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_EXPIRATION: any;
    JWT_REFRESH_EXPIRATION: any;

    JWT_ACTION_SECRET: string;
    JWT_ACTION_EXPIRATION: string;
    JWT_ACTION_VERIFY_SECRET: string;
    JWT_ACTION_VERIFY_EXPIRATION: string;

    OLD_PASSWORD_EXPIRATION: string;
    PASSWORD_HISTORY_DAYS: number;

    EMAIL_USER: string;
    EMAIL_PASSWORD: string;

    FRONTEND_URL: string;

    AWS_S3_BUCKET_NAME: string;
    AWS_ACCESS_KEY: string;
    AWS_SECRET_KEY: string;
    AWS_S3_REGION: string;
    AWS_S3_ACL: ObjectCannedACL;
    AWS_S3_ENDPOINT: string;

    ADMIN_KEY: string;
}

const config: IConfig = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,

    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION,
    JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION,

    JWT_ACTION_SECRET: process.env.JWT_ACTION_SECRET,
    JWT_ACTION_EXPIRATION: process.env.JWT_ACTION_EXPIRATION,
    JWT_ACTION_VERIFY_SECRET: process.env.JWT_ACTION_VERIFY_SECRET,
    JWT_ACTION_VERIFY_EXPIRATION: process.env.JWT_ACTION_VERIFY_EXPIRATION,

    OLD_PASSWORD_EXPIRATION: process.env.OLD_PASSWORD_EXPIRATION,
    PASSWORD_HISTORY_DAYS: Number(process.env.PASSWORD_HISTORY_DAYS),

    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,

    FRONTEND_URL: process.env.FRONTEND_URL,

    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
    AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
    AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
    AWS_S3_REGION: process.env.AWS_S3_REGION,
    AWS_S3_ACL: process.env.AWS_S3_ACL as ObjectCannedACL,
    AWS_S3_ENDPOINT: process.env.AWS_S3_ENDPOINT,

    ADMIN_KEY: process.env.ADMIN_KEY,
};
export { config };
