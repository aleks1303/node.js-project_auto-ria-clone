export const RegexEnum = {
    NAME: /^[A-Z][a-z]{1,9}$/,
    SURNAME: /^[A-Z][a-z]{1,20}([ -][A-Z][a-z]{1,20})?$/,
    PASSWORD: /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\s:])(\S){6,16}$/,
    PHONE: /^\+380\d{9}$/,
};
