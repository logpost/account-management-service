import jwt from "jsonwebtoken";
import config from "../config";
// import RedisAdapter from "../adapters/redis.adapter";
import { checkAccountDidConfirmEmail } from "./policy.handler";

// const refreshTokenStore = RedisAdapter.getInstance();

const createEmailConfirmToken = (info) => {
    const secret = config.jwt.email_token.secret.jwt_secret;

    const claims = {
        expiresIn: config.jwt.email_token.options.expires_in,
        issuer: config.jwt.email_token.options.issuer,
        audience: config.jwt.email_token.options.audience,
    };

    const payload = {
        name: info.name,
        email: info.email,
        role: info.role,
        username: info.username,
        account_type: info.account_type,
        isConfirmEmail: false,
    };

    const email_token = jwt.sign(payload, secret, claims);
    return email_token;
};

const createRefreshToken = (info) => {
    const secret = config.jwt.refresh_token.secret.jwt_secret;

    const claims = {
        expiresIn: config.jwt.refresh_token.options.expires_in,
        issuer: config.jwt.refresh_token.options.issuer,
        audience: config.jwt.refresh_token.options.audience,
    };

    const payload = {
        role: info.role,
        username: info.username,
    };

    const refresh_token = jwt.sign(payload, secret, claims);
    return refresh_token;
};

const createAccessToken = (info) => {
    const secret = config.jwt.access_token.secret.jwt_secret;

    const claims = {
        expiresIn: config.jwt.access_token.options.expires_in,
        issuer: config.jwt.access_token.options.issuer,
        audience: config.jwt.access_token.options.audience,
        subject: info.shipper_id,
    };

    const payload = {
        isConfirmEmail: checkAccountDidConfirmEmail(info.email),
        username: info.username,
        display_name: info.display_name,
        account_type: info.account_type,
        role: info.role,
    };

    const access_token = jwt.sign(payload, secret, claims);
    return access_token;
};

export { createEmailConfirmToken, createAccessToken, createRefreshToken };
