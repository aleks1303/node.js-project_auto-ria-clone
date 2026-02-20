import { StatusCodesEnum } from "../enums/error-enum/status-codes.enum";
import { EmailTypeEnum } from "../enums/user-enum/email-type.enum";
import { RoleEnum } from "../enums/user-enum/role.enum";
import { ApiError } from "../errors/api.error";
import { IBrand } from "../interfaces/brand.interface";
import { logger } from "../logger/logger";
import { brandRepository } from "../repositories/brand.repository";
import { userRepository } from "../repositories/user.repository";
import { emailService } from "./email.service";

class BrandService {
    public async getAll(): Promise<IBrand[]> {
        return brandRepository.getAll();
    }
    public async missingBrand(
        userId: string,
        brandName: string,
    ): Promise<void> {
        const user = await userRepository.getById(userId);
        if (!user) {
            throw new ApiError("User not found", StatusCodesEnum.NOT_FOUND);
        }
        const managers = await userRepository.findByRole(RoleEnum.MANAGER);
        const emails = managers.map((m) => m.email);

        if (!emails.length) {
            logger.warn(`MissingBrand request ignored: No managers found.`);
            return;
        }
        await emailService.sendMail(
            EmailTypeEnum.MISSING_BRAND,
            emails.join(","),
            {
                userId,
                brandName,
                name: user.name,
                email: user.email,
                requestDate: new Date().toLocaleDateString("uk-UA"),
            },
        );
    }
}
export const brandService = new BrandService();
