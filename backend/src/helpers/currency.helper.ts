import { CurrencyEnum } from "../enums/car-enum/currency.enum";
import {
    IConvertedPrices,
    IExchangeRates,
} from "../interfaces/currency.interface";

class CurrencyHelper {
    // 1. Наш "Мок" - імітуємо, що це прийшло з API Привату
    private getRates(): IExchangeRates {
        return {
            [CurrencyEnum.USD]: 41.1,
            [CurrencyEnum.EUR]: 51.1,
            [CurrencyEnum.UAH]: 1,
        };
    }

    // 2. Функція, яка конвертує все в гривню, а потім у все інше
    public convertAll(
        price: number,
        currency: CurrencyEnum,
    ): { convertedPrices: IConvertedPrices; exchangeRates: IExchangeRates } {
        const rates = this.getRates();

        // Конвертуємо вхідну ціну в базову валюту (UAH)
        const priceInUah = price * rates[currency];

        return {
            convertedPrices: {
                UAH: Math.round(priceInUah),
                USD: Math.round(priceInUah / rates[CurrencyEnum.USD]),
                EUR: Math.round(priceInUah / rates[CurrencyEnum.EUR]),
            },
            exchangeRates: rates, // Беремо долар як основний курс для звіту
        };
    }
}
export const currencyHelper = new CurrencyHelper();
