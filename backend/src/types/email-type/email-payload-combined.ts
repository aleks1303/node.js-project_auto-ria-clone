import { ICar } from "../../interfaces/car.interface";

export type EmailPayloadCombined = {
    name?: string;
    email?: string;
    actionToken?: string;
    car?: ICar;
    editCount?: number;
    brand?: string;
    userId?: string;
    requestDate?: string | Date;
};
