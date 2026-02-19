import { config } from "../configs/config";
import { rolePermissions } from "../constants/permissions.constant";
import { StatusCodesEnum } from "../enums/error-enum/status-codes.enum";
import { accountTypeEnum } from "../enums/user-enum/account-type.enum";
import { RoleEnum } from "../enums/user-enum/role.enum";
import { ApiError } from "../errors/api.error";
import { IAdminCreateDTO, IUser } from "../interfaces/user.interface";
import { userRepository } from "../repositories/user.repository";
import { passwordService } from "./password.service";

class AdminService {
    public async createAdmin(dto: IAdminCreateDTO): Promise<IUser> {
        const { key, password, ...rest } = dto;
        if (key !== config.ADMIN_KEY) {
            throw new ApiError(
                "Invalid initialization key",
                StatusCodesEnum.FORBIDDEN,
            );
        }
        const hashPassword = await passwordService.hashPassword(password);
        return userRepository.create({
            ...rest,
            password: hashPassword,
            role: RoleEnum.ADMIN,
            accountType: accountTypeEnum.PREMIUM,
            permissions: rolePermissions[RoleEnum.ADMIN],
            isVerified: true,
        });
    }
}
export const adminService = new AdminService();
