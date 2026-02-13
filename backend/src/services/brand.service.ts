import { IBrand } from "../interfaces/brand.interface";
import { brandRepository } from "../repositories/brand.repository";

class BrandService {
    public async getAll(): Promise<IBrand[]> {
        return brandRepository.getAll();
    }
}
export const brandService = new BrandService();
