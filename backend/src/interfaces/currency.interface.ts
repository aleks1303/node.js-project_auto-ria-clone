import { CurrencyEnum } from "../enums/car-enum/currency.enum";

export interface IConvertedPrices {
    USD: number;
    EUR: number;
    UAH: number;
}

export interface ICurrencyInfo {
    price: number;
    currency: CurrencyEnum;
    exchangeRate: number;
    convertedPrices: IConvertedPrices;
}
