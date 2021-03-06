import express from "express";
import jwt from "jsonwebtoken";

import config from "../config";
import { cookieOptions } from "../helper/cookie.handler";
import responseHandler, { responseSender } from "../helper/response.handler";
import passport from "../middlewares/auth.middleware";
import AccountUsecase from "../usecase/account.usecase";

const prefix = "/account";
const router = express.Router();
const accountUsecase = new AccountUsecase();

router.get(`${prefix}/healthcheck`, (_, res) => {
    responseHandler(async () => {
        return "200 : Server is alive.";
    }, res);
});

router.get(`${prefix}/healthcheck/token/email`, passport.verifyEmail, async (req, res) => {
    responseHandler(async () => {
        return { msg: `ok ${req.user}, verify email_token` };
    }, res);
});

router.get(`${prefix}/healthcheck/token/private`, passport.verifyAuth, async (req, res) => {
    responseHandler(async () => {
        return { msg: `ok ${req.user}, verify token_private` };
    }, res);
});

router.get(`${prefix}/srv/create/service/:service_name`, async (req, res) => {
    responseHandler(async () => {
        const { service_name } = req.params;
        const token_service = await accountUsecase.createService(service_name);
        return { token_service };
    }, res);
});

router.post(`${prefix}/signup/:role`, async (req, res) => {
    responseHandler(async () => {
        const { role } = req.params;
        const profile = req.body;

        if (role) {
            try {
                const data = await accountUsecase.signup(role, profile);
                return data;
            } catch (error) {
                throw error;
            }
        }
        throw new Error("400 : Invalid, role is empty on param query");
    }, res);
});

router.post(`${prefix}/login/:role`, async (req, res) => {
    responseHandler(async () => {
        const { role } = req.params;
        const { username, password } = req.body;
        if (role) {
            const [refresh_token, access_token, email_token] = await accountUsecase.login(role, username, password);

            if (email_token && refresh_token && access_token) {
                res.cookie("refresh_token", refresh_token, cookieOptions);
                return {
                    access_token,
                    email_token,
                };
            } else if (access_token && refresh_token) {
                res.cookie("refresh_token", refresh_token, cookieOptions);
                return { access_token };
            } else {
                throw new Error("500 : Account service isn't alive.");
            }
        } else {
            throw new Error("400 : Invalid, role is empty on param query");
        }
    }, res);
});

router.post(`${prefix}/logout`, passport.verifyRefreshToken, async (req, res) => {
    responseHandler(async () => {
        const { refresh_token } = req.signedCookies;
        if (refresh_token) {
            return await accountUsecase.logout(refresh_token);
        }
        throw new Error("400 : Invalid, Cookie is invalid");
    }, res);
});

router.get(`${prefix}/token`, passport.verifyRefreshToken, async (req, res) => {
    responseHandler(async () => {
        const account = req.user;
        const { refresh_token } = req.signedCookies;
        const { role } = account;
        if (refresh_token) {
            if (role) {
                const access_token = await accountUsecase.generateAccessTokenFromRefreshToken(account, refresh_token);
                return { access_token };
            } else {
                throw new Error("400 : Invalid, role is empty on param query");
            }
        }
        throw new Error("400 : Invalid, Cookie is invalid");
    }, res);
});

router.put(`${prefix}/change/password`, passport.verifyAuth, async (req, res) => {
    responseHandler(async () => {
        try {
            const profile = req.user;
            const data = req.body;
            return await accountUsecase.changePassword(profile, data);
        } catch (error) {
            throw error;
        }
    }, res);
});

router.put(`${prefix}/change/email`, passport.verifyAuth, async (req, res) => {
    responseHandler(async () => {
        try {
            const { isConfirmEmail, ...profile } = req.user;
            const { email } = req.body;
            await accountUsecase.sendEmailForChangeEmail({ ...profile, email });
            return `200 : Done, Message sent to ${email} success. Check your mailbox.`;
        } catch (error) {
            throw error;
        }
    }, res);
});

router.post(`${prefix}/guest/email/confirm/send`, async (req, res) => {
    try {
        const { email_token } = req.query;
        const decoded = jwt.verify(email_token, config.jwt.email_token.secret.jwt_secret);
        const { role, username, email } = decoded;
        const { data: account } = await accountUsecase.findAccountByIdentifier(role, username, "username");
        if (account) {
            if (account.is_email_confirmed) {
                await accountUsecase.sendConfirmEmailAgain({ ...account, email });
                responseSender(`200 : Done, Message sent to ${email} success. Check your mailbox.`, res);
                return;
            }
            responseSender(new Error("404 : Your account has been confirmed."), res);
            return;
        }
        responseSender(new Error("404 : Your account is not exist."), res);
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            res.redirect(`${config.frontend.base_url}/login?redirectCode=100`);
        } else if (error.name === "JsonWebTokenError") {
            res.redirect(`${config.frontend.base_url}/login?redirectCode=200`);
        } else {
            responseSender(new Error(error.message), res);
        }
    }
});

router.post(`${prefix}/logposter/email/confirm/send`, passport.verifyAuth, async (req, res) => {
    responseHandler(async () => {
        const { isConfirmEmail, ...profile } = req.user;
        const { email } = req.body;
        if (isConfirmEmail) return `200 : ${email} has been confirmed.`;
        await accountUsecase.sendConfirmEmailAgain({ ...profile, email });
        return `200 : Done, Message sent to ${email} success. Check your mailbox.`;
    }, res);
});

router.get(`${prefix}/email/confirm/receive/success`, passport.verifyEmail, async (req, res) => {
    const { isConfirmEmail, role, email, username } = req.user;
    if (isConfirmEmail) {
        responseSender(`200 : ${email} has been confirmed.`, res);
        return;
    }

    try {
        await accountUsecase.confirmedWithEmail(role, username, email);
        res.redirect(`${config.frontend.base_url}/alert/success?type=100`);
    } catch (error) {
        responseSender(new Error(error), res);
    }
});

router.get(`${prefix}/email/change/receive/success`, passport.verifyEmail, async (req, res) => {
    const { role, email, username } = req.user;
    try {
        await accountUsecase.changeEmailWithEmail(role, username, email);
        res.redirect(`${config.frontend.base_url}/alert/success?type=200`);
    } catch (error) {
        responseSender(new Error(error), res);
    }
});

export default router;
