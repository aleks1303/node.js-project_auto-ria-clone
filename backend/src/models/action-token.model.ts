import { model, Schema } from "mongoose";

import { nameModel } from "../constants/model.constant";
import { ActionTokenTypeEnum } from "../enums/user-enum/action-token-type.enum";
import { IActionToken } from "../interfaces/action-token.interface";

const actionTokenSchema = new Schema(
    {
        actionToken: { type: String, required: true },
        type: { type: String, required: true, enum: ActionTokenTypeEnum },

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
actionTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });
export const ActionToken = model<IActionToken>(
    nameModel.ACTION_TOKEN,
    actionTokenSchema,
);
