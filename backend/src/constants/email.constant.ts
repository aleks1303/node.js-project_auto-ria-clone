import { EmailTypeEnum } from "../enums/user-enum/email-type.enum";

export const EmailConstant = {
    [EmailTypeEnum.WELCOME]: {
        subject: "Welcome to our platform",
        template: "welcome",
    },
    [EmailTypeEnum.FORGOT_PASSWORD]: {
        subject: "Are you forgot our password?",
        template: "forgot-password",
    },
    [EmailTypeEnum.BLOCKED_CAR]: {
        subject: "Ad blocked due to violation",
        template: "blocked-car",
    },
    [EmailTypeEnum.MISSING_BRAND]: {
        subject: "Новий запит на додавання марки авто",
        template: "missing-brand",
    },
};
