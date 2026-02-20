import { PermissionsEnum } from "../enums/user-enum/permissions.enum";
import { RoleEnum } from "../enums/user-enum/role.enum";

type RolePermissions = Record<RoleEnum, PermissionsEnum[]>;

export const rolePermissions: RolePermissions = {
    [RoleEnum.BUYER]: [],

    [RoleEnum.SELLER]: [
        PermissionsEnum.CARS_CREATE,
        PermissionsEnum.CARS_UPDATE_OWN,
        PermissionsEnum.CARS_DELETE_OWN,
    ],

    [RoleEnum.MANAGER]: [
        PermissionsEnum.USERS_GET_ALL,
        PermissionsEnum.USERS_GET_DETAILS,
        PermissionsEnum.USERS_BAN,
        PermissionsEnum.USERS_DELETE,
        PermissionsEnum.ADS_VALIDATE,
        PermissionsEnum.CARS_UPDATE_ALL,
        PermissionsEnum.CARS_DELETE_ALL,
        PermissionsEnum.STATS_SEE_PREMIUM,
        PermissionsEnum.CARS_SEE_DETAILS_ALL,
    ],

    [RoleEnum.ADMIN]: Object.values(PermissionsEnum),
};
