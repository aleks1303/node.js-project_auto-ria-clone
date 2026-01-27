import { CarStatusEnum } from "../enums/car-enum/car-status.enum";
import { IBase } from "./base.interface";
import { ICurrencyInfo } from "./currency.interface";

export interface ICarModeration {
    status: CarStatusEnum;
    editCount: number;
}

export interface ICar extends IBase, ICurrencyInfo, ICarModeration {
    _id?: string;
    brand: string;
    model: string;
    year: number;
    image?: string;
    description: string;
    region: string;
    _userId: string;
}
