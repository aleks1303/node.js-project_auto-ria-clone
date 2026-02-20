import { randomUUID } from "node:crypto";
import path from "node:path";

import {
    DeleteObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { UploadedFile } from "express-fileupload";

import { config } from "../configs/config";
import { FileItemTypeEnum } from "../enums/user-enum/file-item-type.enum";
import { logger } from "../logger/logger";

class S3Service {
    constructor(
        private readonly client = new S3Client({
            region: config.AWS_S3_REGION,
            credentials: {
                accessKeyId: config.AWS_ACCESS_KEY,
                secretAccessKey: config.AWS_SECRET_KEY,
            },
        }),
    ) {}

    public async uploadFile(
        file: UploadedFile,
        itemType: FileItemTypeEnum,
        itemId: string,
        oldFilePath: string,
    ): Promise<string> {
        try {
            const filePath = this.buildPath(itemType, itemId, file.name);
            if (oldFilePath) {
                await this.deleteFile(oldFilePath);
            }
            await this.client.send(
                new PutObjectCommand({
                    Bucket: config.AWS_S3_BUCKET_NAME,
                    Key: filePath,
                    Body: file.data,
                    ContentType: file.mimetype,
                    ACL: config.AWS_S3_ACL,
                }),
            );
            return filePath;
        } catch (error) {
            logger.error("S3 Upload Error:", error);
        }
    }

    public async deleteFile(filePath: string): Promise<void> {
        try {
            await this.client.send(
                new DeleteObjectCommand({
                    Bucket: config.AWS_S3_BUCKET_NAME,
                    Key: filePath,
                }),
            );
        } catch (error) {
            logger.error("S3 Delete Error:", error);
        }
    }
    private buildPath(
        itemType: FileItemTypeEnum,
        itemId: string,
        fileName: string,
    ): string {
        return `${itemType}/${itemId}/${randomUUID()}${path.extname(fileName)}`;
    }
}
export const s3Service = new S3Service();
