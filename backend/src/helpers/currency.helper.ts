import { CurrencyEnum } from "../enums/car-enum/currency.enum";
import {
    IConvertedPrices,
    IExchangeRates,
} from "../interfaces/currency.interface";

class CurrencyHelper {
    private getRates(): IExchangeRates {
        return {
            [CurrencyEnum.USD]: 43.4,
            [CurrencyEnum.EUR]: 51.3,
            [CurrencyEnum.UAH]: 1,
        };
    }

    public convertAll(
        price: number,
        currency: CurrencyEnum,
    ): { convertedPrices: IConvertedPrices; exchangeRates: IExchangeRates } {
        const rates = this.getRates();
        const priceInUah = price * rates[currency];

        return {
            convertedPrices: {
                UAH: Math.round(priceInUah),
                USD: Math.round(priceInUah / rates[CurrencyEnum.USD]),
                EUR: Math.round(priceInUah / rates[CurrencyEnum.EUR]),
            },
            exchangeRates: rates,
        };
    }
}
export const currencyHelper = new CurrencyHelper();
