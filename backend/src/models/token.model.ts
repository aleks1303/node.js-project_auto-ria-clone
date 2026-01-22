import { model, Schema } from "mongoose";

import { IToken } from "../interfaces/token.interface";
import { User } from "./user.model";

const tokenSchema = new Schema(
    {
        refreshToken: { type: String, required: true },
        _userId: { type: Schema.Types.ObjectId, required: true, ref: User },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);
tokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86500 });
export const Token = model<IToken>("tokens", tokenSchema);
