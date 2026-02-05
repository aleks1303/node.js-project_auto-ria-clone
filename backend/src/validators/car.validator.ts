import Joi from "joi";

import { CarListOrderByEnum } from "../enums/car-enum/car-list-order-by.enum";
import { CurrencyEnum } from "../enums/car-enum/currency.enum";
import { OrderEnum } from "../enums/user-enum/order";

export class CarValidator {
    private static brand = Joi.string().min(2).max(30).trim();
    private static model = Joi.string().min(1).max(30).trim();
    private static year = Joi.number()
        .integer()
        .min(1900)
        .max(new Date().getFullYear());
    private static description = Joi.string().min(10).max(1000);
    private static region = Joi.string();
    private static city = Joi.string();
    private static price = Joi.number().positive();
    private static currency = Joi.string().valid(
        ...Object.values(CurrencyEnum),
    );

    public static query = Joi.object({
        page: Joi.number().integer().min(1).default(1),
        pageSize: Joi.number().integer().min(1).max(100).default(10),
        brand: this.brand, // використовуємо твоє приватне поле
        model: this.model,
        region: this.region,
        priceMin: Joi.number().positive(),
        priceMax: Joi.number().positive(),
        orderBy: Joi.string()
            .valid(...Object.values(CarListOrderByEnum))
            .default(CarListOrderByEnum.CREATED_AT),
        order: Joi.string()
            .valid(...Object.values(OrderEnum)) // Використовуємо твій OrderEnum тут
            .default(OrderEnum.DESC),
    });

    public static create = Joi.object({
        brand: this.brand.required(),
        model: this.model.required(),
        year: this.year.required(),
        description: this.description.required(),
        region: this.region,
        city: this.city,
        price: this.price.required(),
        currency: this.currency.required(),
    });

    public static update = Joi.object({
        description: this.description,
        region: this.region,
        city: this.city,
        price: this.price,
        currency: this.currency,
    });
}
