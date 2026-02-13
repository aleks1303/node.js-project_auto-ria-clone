import { Types } from "mongoose";

import { CarListOrderByEnum } from "../enums/car-enum/car-list-order-by.enum";
import { CarStatusEnum } from "../enums/car-enum/car-status.enum";
import { CurrencyEnum } from "../enums/car-enum/currency.enum";
import { OrderEnum } from "../enums/user-enum/order";
import { IBase } from "./base.interface";
import { IConvertedPrices, ICurrencyInfo } from "./currency.interface";

export interface ICarModeration {
    status: CarStatusEnum;
    editCount: number;
}

export interface ICar extends IBase, ICurrencyInfo, ICarModeration {
    _id?: Types.ObjectId | string;
    brand: string;
    model: string;
    year: number;
    image?: string;
    description: string;
    region: string;
    city: string;
    views: Date[];
    _userId: Types.ObjectId | string;
}

export interface ICarUpdateDto {
    price?: number;
    currency?: CurrencyEnum;
    description?: string;
    region?: string;
    city?: string;
}
export interface ICarUpdateDb extends ICarUpdateDto {
    status?: CarStatusEnum;
    editCount?: number;
    exchangeRate?: number;
    convertedPrices?: IConvertedPrices;
    image?: string;
}
export type ICarCreateDb = Omit<
    ICar,
    "_id" | "updatedAt" | "image" | "exchangeRate" | "createdAt"
>;

export type ICarResponse = Pick<
    ICar,
    | "_id"
    | "_userId"
    | "brand"
    | "model"
    | "year"
    | "description"
    | "price"
    | "currency"
    | "exchangeRates"
    | "convertedPrices"
    | "region"
    | "city"
    | "status"
    | "image"
    | "createdAt"
>;

export interface IOwnerInfo {
    _id?: Types.ObjectId | string;
    name: string;
    surname: string;
    email: string;
}

export interface ICarsResponseDto {
    _id: Types.ObjectId | string; // Прибираємо опціональність ?, бо id є завжди
    brand: string;
    model: string;
    image: string;
    price: number;
    currency: CurrencyEnum;
    year: number;
    region: string;
    description: string;
    createdAt: Date;
    status?: CarStatusEnum;
    // В основному об'єкті ми не показуємо масив дат,
    // тому тут можна лишити як число для загальної кількості
    totalViews?: number;
    owner?: IOwnerInfo;
    // Оновлюємо це поле:
    statistics?: ICarStatistics;
}
// export interface ICarsResponseDto {
//     _id?: Types.ObjectId | string;
//     brand: string;
//     model: string;
//     price: number;
//     currency: CurrencyEnum;
//     year: number;
//     region: string;
//     description: string;
//     createdAt: Date;
//     status?: CarStatusEnum;
//     views?: number;
//     owner?: IOwnerInfo;
//     statistics?: {
//         totalViews: number;
//     };
// }
//  поки не потрібний
// export type ICarsResponseDto = Pick<
//     ICar,
//     | "_id"
//     | "brand"
//     | "model"
//     | "price"
//     | "currency"
//     | "year"
//     | "region"
//     | "description"
//     | "createdAt"
//     | "status"
//     | "views"
// >;

export type ICarCreateDto = Pick<
    ICar,
    | "brand"
    | "model"
    | "year"
    | "price"
    | "currency"
    | "description"
    | "region"
    | "city"
>;
export interface ICarListQuery {
    page: number;
    pageSize: number;
    brand?: string;
    model?: string;
    region?: string;
    priceMin?: number;
    priceMax?: number;
    orderBy: CarListOrderByEnum;
    order: OrderEnum;
}

export interface ICarStatistics {
    views: {
        day: number;
        week: number;
        month: number;
        total: number;
    };
    averagePrice: {
        region: number;
        ukraine: number;
    };
}
