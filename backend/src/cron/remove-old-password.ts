import { CronJob } from "cron";

import { config } from "../configs/config";
import { timeHelper } from "../helpers/time.helper";
import { logger } from "../logger/logger";
import { passwordRepository } from "../repositories/password.repository";

const handler = async () => {
    try {
        const { value, unit } = timeHelper.parseConfigsString(
            config.OLD_PASSWORD_EXPIRATION,
        );
        const date = timeHelper.subtractByParams(value, unit);
        await passwordRepository.deleteBeforeDate(date);
    } catch (error) {
        logger.error(error);
    }
};
export const removeOldPassword = new CronJob(" 0 3 * * *", handler);
