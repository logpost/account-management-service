import errorHandler from "./errors.handler";
import parseResponse from "./response.parser";

export const convertOjectToQuerys = (obj) => {
    return Object.keys(obj)
        .map((key) => key + "=" + obj[key])
        .join("&");
};

export const responseSender = async (data, res) => {
    const dataParsed = parseResponse(data);
    res = await errorHandler.response(dataParsed, res);
    res.send(dataParsed);
};

const responseHandler = async (next, res) => {
    try {
        const data = await next();
        responseSender(data, res);
    } catch (error) {
        responseSender(error, res);
    }
};

export default responseHandler;
