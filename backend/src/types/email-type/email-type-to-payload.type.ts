import { EmailTypeEnum } from "../../enums/user-enum/email-type.enum";
import { EmailPayloadCombined } from "./email-payload-combined";
import { PickRequired } from "./pick-required.type";

export type EmailTypeToPayload = {
    [EmailTypeEnum.WELCOME]: PickRequired<
        EmailPayloadCombined,
        "name" | "email" | "actionToken"
    >;
    [EmailTypeEnum.FORGOT_PASSWORD]: PickRequired<
        EmailPayloadCombined,
        "email" | "name" | "actionToken"
    >;
};
