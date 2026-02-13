import { IBrand } from "../interfaces/brand.interface";
import { Brand } from "../models/brand.model";

class BrandRepository {
    public async getAll(): Promise<IBrand[]> {
        return Brand.find().sort({ name: 1 }).lean();
    }
    public async getByBrandAndModel(
        brand: string,
        models: string,
    ): Promise<IBrand | null> {
        return Brand.findOne({ brand, models }).lean();
    }
}
export const brandRepository = new BrandRepository();
