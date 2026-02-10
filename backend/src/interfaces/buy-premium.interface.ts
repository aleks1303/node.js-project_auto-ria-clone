import { ITokenPair } from "./token.interface";
import { IUser } from "./user.interface";

export interface IBuyPremiumResponse {
    user: IUser;
    tokens: ITokenPair;
}
