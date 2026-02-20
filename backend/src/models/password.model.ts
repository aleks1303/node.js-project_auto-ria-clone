import { model, Schema } from "mongoose";

import { nameModel } from "../constants/model.constant";
import { IPassword } from "../interfaces/password.interface";

const passwordSchema = new Schema(
    {
        password: { type: String, required: true },
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
export const Password = model<IPassword>(nameModel.PASSWORD, passwordSchema);
