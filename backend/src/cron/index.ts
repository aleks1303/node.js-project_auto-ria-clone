import { updateCurrencyCron } from "./exchange-rate";
import { removeOldPassword } from "./remove-old-password";

export const runnerCrones = () => {
    removeOldPassword.start();
    updateCurrencyCron.start();
};
