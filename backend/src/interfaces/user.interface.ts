import { accountTypeEnum } from "../enums/account-type.enum";
import { RoleEnum } from "../enums/role.enum";
import { IBase } from "./base.interface";

export interface IUser extends IBase {
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
}
