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
    isDeleted: boolean;
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
    isDeleted?: boolean;
}
export type ICarCreateDb = Omit<
    ICar,
    "_id" | "updatedAt" | "image" | "exchangeRate" | "createdAt" | "isDeleted"
> & { isDeleted?: boolean };
export interface ICarPopulated extends Omit<ICar, "_userId"> {
    _userId: IOwnerInfo;
}
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
    surname?: string;
    email?: string;
    phone?: string;
}
export interface ICarShortResponseDto {
    _id: Types.ObjectId | string;
    brand: string;
    model: string;
    image: string;
    price: number;
    currency: CurrencyEnum;
    year: number;
    region: string;
    city: string;
    createdAt: Date;
}

export interface ICarsResponseDto extends ICarShortResponseDto {
    description: string;
    isDeleted?: boolean;
    status?: CarStatusEnum;
    totalViews?: number;
    owner?: IOwnerInfo;
    statistics?: ICarStatistics;
}

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
        currency: string;
    };
}
