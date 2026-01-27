import Joi from "joi";

import { CurrencyEnum } from "../enums/car-enum/currency.enum";

export class CarValidator {
    private static brand = Joi.string().min(2).max(30).required().trim();
    private static model = Joi.string().min(1).max(30).required().trim();
    private static year = Joi.number()
        .integer()
        .min(1900)
        .max(new Date().getFullYear())
        .required();
    private static description = Joi.string().min(10).max(1000).required();
    private static region = Joi.string().required();
    private static price = Joi.number().positive().required();
    private static currency = Joi.string()
        .valid(...Object.values(CurrencyEnum))
        .required();

    public static create = Joi.object({
        brand: this.brand.required(),
        model: this.model,
        year: this.year,
        description: this.description,
        region: this.region,
        price: this.price,
        currency: this.currency,
    });

    public static update = Joi.object({
        brand: this.brand,
        model: this.model,
        year: this.year,
        description: this.description,
        region: this.region,
        price: this.price,
        currency: this.currency,
    });
}
