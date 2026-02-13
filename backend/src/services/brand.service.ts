import { EmailTypeEnum } from "../enums/user-enum/email-type.enum";
import { RoleEnum } from "../enums/user-enum/role.enum";
import { IBrand } from "../interfaces/brand.interface";
import { brandRepository } from "../repositories/brand.repository";
import { userRepository } from "../repositories/user.repository";
import { emailService } from "./email.service";

class BrandService {
    public async getAll(): Promise<IBrand[]> {
        return brandRepository.getAll();
    }
    // В BrandService
    public async missingBrand(
        userId: string,
        brandName: string,
    ): Promise<void> {
        // 1. Знаходимо менеджерів (як ти робив у CarService)
        const user = await userRepository.getById(userId);
        const managers = await userRepository.findByRole(RoleEnum.MANAGER);
        const emails = managers.map((m) => m.email);

        if (!emails.length) {
            console.warn("Менеджерів не знайдено для відправки звіту");
            return;
        }

        // 2. Відправляємо лист усім менеджерам
        await emailService.sendMail(
            EmailTypeEnum.MISSING_BRAND, // Треба додати в enum
            emails.join(","), // Відправляємо всім одразу
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
