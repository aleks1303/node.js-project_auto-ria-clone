import { EmailTypeEnum } from "../enums/email-type.enum";

export const EmailConstant = {
    [EmailTypeEnum.WELCOME]: {
        subject: "Welcome to our platform",
        template: "welcome",
    },
    [EmailTypeEnum.FORGOT_PASSWORD]: {
        subject: "Are you forgot our password?",
        template: "forgot-password",
    },
    [EmailTypeEnum.LOGOUT]: {
        subject: "Logout to our platform",
        template: "logout",
    },
};
