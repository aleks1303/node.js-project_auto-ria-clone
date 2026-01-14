import { accountTypeEnum } from "../enums/account-type.enum";
import { RoleEnum } from "../enums/role.enum";
import { IBase } from "./base.interface";

export interface IUser extends IBase {
    email: string;
    password: string;
    role: RoleEnum;
    accountType: accountTypeEnum;
    name: string;
    surname: string;
    phone?: string;
    age?: number;
    avatar?: string;
    isActive: boolean;
    isDeleted: boolean;
    isVerified: boolean;
}
