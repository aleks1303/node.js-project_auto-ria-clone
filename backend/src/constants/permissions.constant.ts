import { PermissionsEnum } from "../enums/user-enum/permissions.enum";
import { RoleEnum } from "../enums/user-enum/role.enum";

type RolePermissions = Record<RoleEnum, PermissionsEnum[]>;

export const rolePermissions: RolePermissions = {
    // 1. ПОКУПЕЦЬ: може тільки гуляти по сайту (масив порожній, бо публічні роути не вимагають прав)
    [RoleEnum.BUYER]: [],

    // 2. ПРОДАВЕЦЬ: може створювати та керувати СВОЇМИ авто
    [RoleEnum.SELLER]: [
        PermissionsEnum.CARS_CREATE,
        PermissionsEnum.CARS_UPDATE_OWN,
        PermissionsEnum.CARS_DELETE_OWN,
    ],

    // 3. МЕНЕДЖЕР: банить, видаляє невалідні, перевіряє підозрілі
    [RoleEnum.MANAGER]: [
        PermissionsEnum.USERS_GET_ALL,
        PermissionsEnum.USERS_GET_DETAILS,
        PermissionsEnum.USERS_BAN,
        PermissionsEnum.ADS_VALIDATE,
        PermissionsEnum.CARS_UPDATE_ALL,
        PermissionsEnum.CARS_DELETE_ALL,
        PermissionsEnum.STATS_SEE_PREMIUM,
        PermissionsEnum.CARS_SEE_DETAILS_ALL,
    ],

    // 4. АДМІНІСТРАТОР: може ВСЕ
    [RoleEnum.ADMIN]: Object.values(PermissionsEnum),
};
