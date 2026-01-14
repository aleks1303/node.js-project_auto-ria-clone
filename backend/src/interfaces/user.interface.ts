import { accountTypeEnum } from "../enums/account-type.enum";
import { RoleEnum } from "../enums/role.enum";
import { IBase } from "./base.interface";

export interface IUser extends IBase {
    _id: string;
    name: string;
    surname: string;
    age: number;
    email: string;
    password: string;
    phone: string;
    role: RoleEnum;
    accountType: accountTypeEnum;
    avatar?: string;
    isActive: boolean;
    isDeleted: boolean;
    isVerified: boolean;
    city?: string;
    region?: string;
}

export type IUserCreateDTO = Pick<
    IUser,
    | "name"
    | "surname"
    | "age"
    | "email"
    | "password"
    | "phone"
    | "city"
    | "region"
>;
