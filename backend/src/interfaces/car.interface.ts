import { Types } from "mongoose";

import { CarStatusEnum } from "../enums/car-enum/car-status.enum";
import { CurrencyEnum } from "../enums/car-enum/currency.enum";
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
    views?: number;
    _userId: Types.ObjectId | string;
}

export type ICarCreateDb = Omit<
    ICar,
    "_id" | "updatedAt" | "image" | "exchangeRate" | "createdAt"
>;
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
}

// export type ICarCreateDb = Omit<ICar, "_id" | "updatedAt" | "createdAt">;
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
    | "convertedPrices"
    | "region"
    | "city"
    | "status"
    | "image"
    | "createdAt"
>;

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
}
