import { model, Schema } from "mongoose";

import { nameModel } from "../constants/model.constant";
import { IToken } from "../interfaces/token.interface";

const tokenSchema = new Schema(
    {
        refreshToken: { type: String, required: true },
        _userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: nameModel.USER,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);
tokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86500 });
export const Token = model<IToken>(nameModel.TOKEN, tokenSchema);
