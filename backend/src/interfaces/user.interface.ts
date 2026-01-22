import { accountTypeEnum } from "../enums/account-type.enum";
import { OrderEnum } from "../enums/order";
import { PermissionsEnum } from "../enums/permissions.enum";
import { RoleEnum } from "../enums/role.enum";
import { UserListOrderByEnum } from "../enums/user-list-order-by.enum";
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
    permissions: PermissionsEnum[];
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
    | "role"
    | "permissions"
    | "phone"
    | "city"
    | "region"
>;

export type IUserResponse = Pick<
    IUser,
    | "_id"
    | "name"
    | "surname"
    | "email"
    | "age"
    | "phone"
    | "role"
    | "permissions"
    | "accountType"
    | "city"
    | "region"
    | "avatar"
    | "isActive"
    | "isVerified"
    | "isDeleted"
>;
export type ISignInDTO = Pick<IUser, "email" | "password">;
export type IVerifyType = Pick<IUser, "email">;

export interface IUserListQuery {
    pageSize?: number;
    page?: number;
    search?: string;
    order?: OrderEnum;
    orderBy?: UserListOrderByEnum;
    role?: string;
}

export interface IUserListResponse {
    data: IUserResponse[];
    total: number;
    totalPages: number;
    query: IUserListQuery; // Повертаємо вхідні параметри для фронтенду
}
