import { brands } from "../constants/brands";
import { logger } from "../logger/logger";
import { Brand } from "../models/brand.model";

export const seedBrands = async () => {
    try {
        const count = await Brand.countDocuments();
        if (count === 0) {
            await Brand.insertMany(brands);
            console.log("✅ Brands seeded successfully");
            logger.info(
                "Database seeding: Brand collection has been initialized with default data.",
            );
        }
    } catch (e) {
        console.error("❌ Seeding error:", e);
    }
};
