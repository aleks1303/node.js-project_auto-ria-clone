import { CronJob } from "cron";

import { currencyHelper } from "../helpers/currency.helper";
import { logger } from "../logger/logger";
import { Car } from "../models/car.model";

const handler = async () => {
    try {
        logger.info("Start daily currency update job");

        const cars = await Car.find();

        await Promise.all(
            cars.map((car) => {
                const { convertedPrices, exchangeRates } =
                    currencyHelper.convertAll(car.price, car.currency);

                return Car.updateOne(
                    { _id: car._id },
                    { $set: { convertedPrices, exchangeRates } },
                );
            }),
        );

        logger.info(`Successfully updated ${cars.length} cars`);
    } catch (error) {
        logger.error("Currency Cron Error:", error);
    }
};

export const updateCurrencyCron = new CronJob("0 0 * * *", handler);
