import { UploadedFile } from "express-fileupload";

import { FileItemTypeEnum } from "../enums/file-item-type.enum";
import { ApiError } from "../errors/api.error";
import { ITokenPayload } from "../interfaces/token.interface";
import { IUser } from "../interfaces/user.interface";
import { userRepository } from "../repositories/user.repository";
import { s3Service } from "./s3.service";

class UserService {
    public getAll(): Promise<IUser[]> {
        return userRepository.getAll();
    }

    public async uploadAvatar(
        tokenPayload: ITokenPayload,
        file: UploadedFile,
    ): Promise<IUser> {
        const user = await userRepository.getById(tokenPayload.userId);
        const oldFilePath = user.avatar;
        const avatar = await s3Service.uploadFile(
            file,
            FileItemTypeEnum.USER,
            user._id,
            oldFilePath,
        );
        console.log("--- DEBUG ---");
        console.log("URL from S3:", avatar);

        const update = await userRepository.updateById(user._id, { avatar });
        console.log("Updated user from DB:", update);
        return update;
    }

    public async deleteAvatar(jwtPayload: ITokenPayload): Promise<void> {
        const user = await userRepository.getById(jwtPayload.userId);
        if (!user.avatar) {
            throw new ApiError("User not have an avatar", 400);
        }
        await s3Service.deleteFile(user.avatar);
        await userRepository.updateById(user._id, { avatar: null });
    }
}
export const userService = new UserService();
