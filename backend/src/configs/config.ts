import { ObjectCannedACL } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

interface IConfig {
    PORT: string;
    MONGO_URI: string;

    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_LIFETIME: any;
    JWT_REFRESH_LIFETIME: any;

    JWT_ACTIVATE_SECRET: string;
    JWT_ACTIVATE_LIFETIME: string;
    JWT_RECOVERY_SECRET: string;
    JWT_RECOVERY_LIFETIME: string;

    EMAIL_USER: string;
    EMAIL_PASSWORD: string;

    FRONTEND_URL: string;

    AWS_S3_BUCKET_NAME: string;
    AWS_ACCESS_KEY: string;
    AWS_SECRET_KEY: string;
    AWS_S3_REGION: string;
    AWS_S3_ACL: ObjectCannedACL;
    AWS_S3_ENDPOINT: string;
}

const config: IConfig = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,

    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_ACCESS_LIFETIME: process.env.JWT_ACCESS_LIFETIME,
    JWT_REFRESH_LIFETIME: process.env.JWT_REFRESH_LIFETIME,

    JWT_ACTIVATE_SECRET: process.env.JWT_ACTIVATE_SECRET,
    JWT_ACTIVATE_LIFETIME: process.env.JWT_ACTIVATE_LIFETIME,
    JWT_RECOVERY_SECRET: process.env.JWT_RECOVERY_SECRET,
    JWT_RECOVERY_LIFETIME: process.env.JWT_RECOVERY_LIFETIME,

    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,

    FRONTEND_URL: process.env.FRONTEND_URL,

    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
    AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
    AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
    AWS_S3_REGION: process.env.AWS_S3_REGION,
    AWS_S3_ACL: process.env.AWS_S3_ACL as ObjectCannedACL,
    AWS_S3_ENDPOINT: process.env.AWS_S3_ENDPOINT,
};
export { config };
