import Joi from "joi";

import { RegexEnum } from "../enums/regex.enum";

export class UserValidator {
    private static name = Joi.string()
        .min(2)
        .max(50)
        .regex(RegexEnum.NAME)
        .trim();
    private static surname = Joi.string()
        .min(2)
        .max(50)
        .regex(RegexEnum.SURNAME)
        .trim();
    private static age = Joi.number().min(18).max(120);
    private static email = Joi.string().email().lowercase().trim();
    private static password = Joi.string().regex(RegexEnum.PASSWORD);
    private static phone = Joi.string().regex(RegexEnum.PHONE);

    public static create = Joi.object({
        name: this.name.required(),
        surname: this.surname.required(),
        age: this.age.required(),
        email: this.email.required(),
        password: this.password.required(),
        phone: this.phone.required(),
    });
}

// private static role = Joi.object()
//     .valid(...Object.values(RoleEnum))
//     .default(RoleEnum.BUYER);
// private static accountType = Joi.object()
//     .valid(...Object.values(accountTypeEnum))
//     .default(accountTypeEnum.BASIS);
