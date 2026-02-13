// brand.validator.ts
import Joi from "joi";

export class BrandValidator {
    static report = Joi.object({
        brandName: Joi.string().min(2).max(50).trim().required().messages({
            "string.empty": "Назва марки не може бути порожньою",
            "string.min": "Назва занадто коротка",
        }),
    });
}
