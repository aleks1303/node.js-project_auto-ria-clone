import { model, Schema } from "mongoose";

import { nameModel } from "../constants/model.constant";
import { CarStatusEnum } from "../enums/car-enum/car-status.enum";
import { CurrencyEnum } from "../enums/car-enum/currency.enum";

const carSchema = new Schema(
    {
        brand: { type: String, required: true },
        model: { type: String, required: true },
        year: { type: Number, required: true },
        image: { type: String, default: "" },
        description: { type: String, required: true },
        views: { type: [Date], default: [] },
        region: { type: String, required: true },
        city: { type: String, required: true },

        // Блок ціни
        price: { type: Number, required: true },
        currency: { type: String, enum: CurrencyEnum, required: true },
        exchangeRates: {
            USD: { type: Number },
            EUR: { type: Number },
        },
        convertedPrices: {
            USD: { type: Number, required: true },
            EUR: { type: Number, required: true },
            UAH: { type: Number, required: true },
        },

        // Блок модерації
        status: {
            type: String,
            enum: CarStatusEnum,
            default: CarStatusEnum.ACTIVE,
        },
        editCount: { type: Number, default: 0 },
        isDeleted: { type: Boolean, default: false },

        // Зв'язок з юзером
        _userId: {
            type: Schema.Types.ObjectId,
            ref: nameModel.USER,
            required: true,
        },
    },
    { timestamps: true, versionKey: false },
);

export const Car = model(nameModel.CAR, carSchema);
