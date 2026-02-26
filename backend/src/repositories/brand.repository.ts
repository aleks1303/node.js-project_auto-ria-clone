import { IBrand } from "../interfaces/brand.interface";
import { Brand } from "../models/brand.model";

class BrandRepository {
    public async getAll(): Promise<IBrand[]> {
        return Brand.find().sort({ brand: 1 }).lean();
    }
    public async getByBrandAndModel(
        brand: string,
        models: string,
    ): Promise<IBrand | null> {
        return Brand.findOne({ brand, models }).lean();
    }
    public async addBrandAndModels(
        brandName: string,
        models: string[],
    ): Promise<IBrand> {
        return Brand.findOneAndUpdate(
            { brand: brandName },
            {
                $addToSet: { models: { $each: models } },
            },
            {
                upsert: true,
                new: true,
                runValidators: true,
            },
        ).exec();
    }
}
export const brandRepository = new BrandRepository();
