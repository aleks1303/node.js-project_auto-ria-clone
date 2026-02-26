import { brands } from "../constants/brands";
import { logger } from "../logger/logger";
import { Brand } from "../models/brand.model";

export const seedBrands = async () => {
    try {
        const count = await Brand.countDocuments();
        if (count === 0) {
            await Brand.insertMany(brands);
            logger.info("Brands seeded successfully");
        }
    } catch (e) {
        logger.error("Seeding error:", e);
    }
};
