import { CurrencyEnum } from "../enums/car-enum/currency.enum";

export interface IExchangeRates {
    USD?: number;
    EUR?: number;
    UAH?: number;
}
export interface IConvertedPrices {
    USD: number;
    EUR: number;
    UAH: number;
}

export interface ICurrencyInfo {
    price: number;
    currency: CurrencyEnum;
    exchangeRates?: IExchangeRates;
    convertedPrices?: IConvertedPrices;
}
