import { model, Schema } from "mongoose";

import { nameModel } from "../constants/model.constant";
import { IBrand } from "../interfaces/brand.interface";

const brandSchema = new Schema(
    {
        brand: { type: String, unique: true, required: true, trim: true },
        model: { type: [String], default: [] },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);
export const Brand = model<IBrand>(nameModel.BRAND, brandSchema);
