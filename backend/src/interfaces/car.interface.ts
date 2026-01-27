import { Types } from "mongoose";

import { CarStatusEnum } from "../enums/car-enum/car-status.enum";
import { IBase } from "./base.interface";
import { ICurrencyInfo } from "./currency.interface";

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
    _userId: Types.ObjectId | string;
}

export type ICarResponse = Pick<
    ICar,
    | "_id"
    | "brand"
    | "model"
    | "year"
    | "description"
    | "price"
    | "currency"
    | "convertedPrices"
    | "region"
    | "status"
    | "image"
    | "createdAt"
>;

export type ICarCreateDto = Pick<
    ICar,
    "brand" | "model" | "year" | "price" | "currency" | "description" | "region"
>;
