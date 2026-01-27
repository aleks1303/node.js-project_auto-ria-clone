export enum PermissionsEnum {
    // КОРИСТУВАЧІ (USERS)
    USERS_GET_ALL = "users.get.all",
    USERS_GET_DETAILS = "users.get.details",
    USERS_BAN = "users.ban",
    USERS_DELETE = "users.delete",
    USERS_UPDATE_ROLE = "users.update.role",

    // ОГОЛОШЕННЯ / АВТО (CARS)
    CARS_CREATE = "cars.create",
    CARS_UPDATE_OWN = "cars.update.own",
    CARS_UPDATE_ALL = "cars.update.all",
    CARS_DELETE_OWN = "cars.delete.own",
    CARS_DELETE_ALL = "cars.delete.all",

    // МОДЕРАЦІЯ (ADS)
    ADS_VALIDATE = "ads.validate",

    // СТАТИСТИКА
    STATS_SEE_PREMIUM = "stats.see.premium",
}
