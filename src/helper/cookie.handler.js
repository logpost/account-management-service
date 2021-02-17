import config from "../config";

export const expireInDays = (days) => {
    let today = new Date();
    let resultDate = new Date(today);
    resultDate.setDate(today.getDate() + days);
    return resultDate;
};

export const cookieOptions = {
    ...config.cookie.options,
    expires: expireInDays(config.cookie.options.expires),
};
