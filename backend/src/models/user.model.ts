import { model, Schema } from "mongoose";

import { accountTypeEnum } from "../enums/account-type.enum"; // Твій новий enum
import { PermissionsEnum } from "../enums/permissions.enum";
import { RoleEnum } from "../enums/role.enum";
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
        permissions: {
            type: [String],
            enum: Object.values(PermissionsEnum),
            default: [],
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

        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false },

        city: { type: String, required: false, trim: true },
        region: { type: String, required: false, trim: true },
    },
    {
        timestamps: true,
        versionKey: false,
        // toJSON: {
        //     transform: (doc, ret) => {
        //         delete ret.password;
        //         if (ret.avatar) {
        //             ret.avatar = `/media/${path.basename(ret.avatar)}`;
        //         }
        //         return ret;
        //     },
        // },
    },
);

export const User = model<IUser>("users", userSchema);
