import { IFileConfig } from "../interfaces/file-config.interface";

export const carPhotoConfig: IFileConfig = {
    maxSize: 5 * 1024 * 1024,
    mimes: ["image/jpeg", "image/png", "image/png", "image/webp"],
};
