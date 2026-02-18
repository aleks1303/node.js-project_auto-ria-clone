import { model, Schema } from "mongoose";

import { nameModel } from "../constants/model.constant";
import { accountTypeEnum } from "../enums/user-enum/account-type.enum"; // Твій новий enum
import { RoleEnum } from "../enums/user-enum/role.enum";
import { IUser } from "../interfaces/user.interface";

const userSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: Object.values(RoleEnum),
            required: true,
            default: RoleEnum.BUYER,
        },
        accountType: {
            type: String,
            enum: Object.values(accountTypeEnum),
            required: true,
            default: accountTypeEnum.BASIS,
        },
        name: { type: String, required: true, trim: true },
        surname: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true, unique: true },
        age: { type: Number, required: true },
        avatar: { type: String, default: "" },

        isBanned: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false },

        city: { type: String, required: false, trim: true },
        region: { type: String, required: false, trim: true },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

export const User = model<IUser>(nameModel.USER, userSchema);
