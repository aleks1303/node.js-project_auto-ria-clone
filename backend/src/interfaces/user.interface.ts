import { accountTypeEnum } from "../enums/user-enum/account-type.enum";
import { OrderEnum } from "../enums/user-enum/order";
import { PermissionsEnum } from "../enums/user-enum/permissions.enum";
import { RoleEnum } from "../enums/user-enum/role.enum";
import { UserListOrderByEnum } from "../enums/user-enum/user-list-order-by.enum";
import { IBase } from "./base.interface";
import { ITokenPair } from "./token.interface";

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
    isBanned: boolean;
    isActive: boolean;
    isDeleted: boolean;
    isVerified: boolean;
    city?: string;
    region?: string;
}

export interface IUserDetailsResponse {
    _id: string;
    name: string;
    surname: string;
    phone: string;
    city: string;
    region: string;
    avatar: string | null;
    email?: string;
    age?: number;
    role?: RoleEnum;
    permissions?: PermissionsEnum[];
    accountType?: accountTypeEnum;
    isBanned?: boolean;
    isActive?: boolean;
    isVerified?: boolean;
    isDeleted?: boolean;
}

export type IUserCreateDTO = Pick<
    IUser,
    | "name"
    | "surname"
    | "age"
    | "email"
    | "password"
    | "role"
    | "phone"
    | "city"
    | "region"
>;
export type IManagerCreateDTO = Omit<IUserCreateDTO, "role">;

export type IAdminCreateDTO = Omit<IUserCreateDTO, "role"> & { key: string };

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
    | "isBanned"
    | "isActive"
    | "isVerified"
    | "isDeleted"
>;

export interface IUserUpdateDto {
    name?: string;
    surname?: string;
    age?: number;
    phone?: string;
    city?: string;
    region?: string;
}
export type ISignInDTO = Pick<IUser, "email" | "password">;
export type CheckEmail = Pick<IUser, "email">;
export type ForgotPasswordSet = Pick<IUser, "password"> & {
    actionToken: string;
};
export type UpgradeUserDto = Partial<Pick<IUser, "role" | "accountType">>;

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
    query: IUserListQuery;
}
export interface IUserWithTokens {
    user: IUser;
    tokens: ITokenPair;
}
