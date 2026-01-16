import { IFileConfig } from "../interfaces/file-config.interface";

export const avatarConfig: IFileConfig = {
    maxSize: 2 * 1024 * 1024,
    mimes: ["image/jpg", "image/jpeg", "image/png", "image/webp"],
};
