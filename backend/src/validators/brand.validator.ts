import Joi from "joi";

export class BrandValidator {
    static report = Joi.object({
        brandName: Joi.string().min(2).max(50).trim().required(),
    });
}
