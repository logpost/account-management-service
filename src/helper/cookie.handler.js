export const expireInDays = (days) => {
    let today = new Date();
    let resultDate = new Date(today);
    resultDate.setDate(today.getDate() + days);
    return resultDate;
};
