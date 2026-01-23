import Joi from "joi";

import { OrderEnum } from "../enums/order";
import { RegexEnum } from "../enums/regex.enum";
import { RoleEnum } from "../enums/role.enum";
import { UserListOrderByEnum } from "../enums/user-list-order-by.enum";

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
    private static city = Joi.string().min(2).max(30).trim();
    private static region = Joi.string().min(2).max(30).trim();
    private static role = Joi.string().valid(...Object.values(RoleEnum));

    public static create = Joi.object({
        name: this.name.required(),
        surname: this.surname.required(),
        age: this.age.required(),
        email: this.email.required(),
        password: this.password.required(),
        phone: this.phone.required(),
        city: this.city.optional(),
        region: this.region.optional(),
        role: this.role
            .valid(RoleEnum.BUYER, RoleEnum.SELLER)
            .default(RoleEnum.BUYER),
    });

    public static signIn = Joi.object({
        email: this.email.required(),
        password: this.password.required(),
    });

    public static update = Joi.object({
        name: this.name,
        surname: this.surname,
        age: this.age,
        phone: this.phone,
        city: this.city,
        region: this.region,
    }).min(1);

    public static verify = Joi.object({
        email: this.email,
    });

    public static setForgotPassword = Joi.object({
        password: this.password,
        actionToken: Joi.string().trim().required(),
    });

    public static query = Joi.object({
        pageSize: Joi.number().min(1).max(100).default(10),
        page: Joi.number().min(1).default(1),
        search: Joi.string().trim().allow(""),
        orderBy: Joi.string()
            .valid(...Object.values(UserListOrderByEnum))
            .default(UserListOrderByEnum.NAME),
        order: Joi.string()
            .valid(...Object.values(OrderEnum))
            .default(OrderEnum.ASC),
        role: Joi.string()
            .valid(...Object.values(RoleEnum))
            .optional(),
    });
}
