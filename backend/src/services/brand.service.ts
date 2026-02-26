import { EmailTypeEnum } from "../enums/user-enum/email-type.enum";
import { RoleEnum } from "../enums/user-enum/role.enum";
import { IBrand } from "../interfaces/brand.interface";
import { IUser } from "../interfaces/user.interface";
import { logger } from "../logger/logger";
import { brandRepository } from "../repositories/brand.repository";
import { userRepository } from "../repositories/user.repository";
import { emailService } from "./email.service";

class BrandService {
    public async getAll(): Promise<IBrand[]> {
        return brandRepository.getAll();
    }
    public async missingBrand(user: IUser, brand: string): Promise<void> {
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
                userId: user._id.toString(),
                brand,
                name: user.name,
                email: user.email,
                requestDate: new Date().toLocaleDateString("uk-UA"),
            },
        );
    }

    public async addBrandAndModels(
        brandName: string,
        newModels: string[],
    ): Promise<IBrand> {
        const brandToAdd = brandName.trim().toUpperCase();
        const modelsToAdd = newModels.map((m) => m.trim().toUpperCase());

        return brandRepository.addBrandAndModels(brandToAdd, modelsToAdd);
    }
}
export const brandService = new BrandService();
