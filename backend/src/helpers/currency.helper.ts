import { CurrencyEnum } from "../enums/car-enum/currency.enum";
import { IConvertedPrices } from "../interfaces/currency.interface";

class CurrencyHelper {
    // 1. Наш "Мок" - імітуємо, що це прийшло з API Привату
    private getRates() {
        return {
            [CurrencyEnum.USD]: 42.2,
            [CurrencyEnum.EUR]: 51.5,
        };
    }

    // 2. Функція, яка конвертує все в гривню, а потім у все інше
    public convertAll(
        price: number,
        currency: CurrencyEnum,
    ): { convertedPrices: IConvertedPrices; exchangeRate: number } {
        const rates = this.getRates();
        let priceInUah = 0;

        // Конвертуємо вхідну ціну в базову валюту (UAH)
        if (currency === CurrencyEnum.UAH) {
            priceInUah = price;
        } else if (currency === CurrencyEnum.USD) {
            priceInUah = price * rates[CurrencyEnum.USD];
        } else if (currency === CurrencyEnum.EUR) {
            priceInUah = price * rates[CurrencyEnum.EUR];
        }

        return {
            convertedPrices: {
                UAH: Math.round(priceInUah),
                USD: Math.round(priceInUah / rates[CurrencyEnum.USD]),
                EUR: Math.round(priceInUah / rates[CurrencyEnum.EUR]),
            },
            exchangeRate: rates[CurrencyEnum.USD], // Беремо долар як основний курс для звіту
        };
    }
}
export const currencyHelper = new CurrencyHelper();
