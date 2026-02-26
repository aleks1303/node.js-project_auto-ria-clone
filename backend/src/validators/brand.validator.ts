import Joi from "joi";

export class BrandValidator {
    private static brand = Joi.string().min(2).max(50).trim().uppercase();
    private static model = Joi.string().min(1).max(50).trim().uppercase();

    public static report = Joi.object({
        brand: this.brand.required(),
    });
    public static addBrandAndModel = Joi.object({
        brand: this.brand.required(),
        models: Joi.array().items(this.model).min(1).required(),
    });
}
