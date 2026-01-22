import { ActionTokenTypeEnum } from "../enums/action-token-type.enum";

export interface IActionToken {
    _id: string;
    actionToken: string;
    type: ActionTokenTypeEnum;
    _userId: string;
}
