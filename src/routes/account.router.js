import express from "express";

import config from "../config";
import AccountUsecase from "../usecase/account.usecase";

import passport from "../middlewares/auth.middleware";
import responseHandler, { responseSender } from "../helper/response.handler";
import { expireInDays } from "../helper/cookie.handler";

const prefix = "/account";
const router = express.Router();
const accountUsecase = new AccountUsecase();

router.get(`${prefix}/healthcheck`, (req, res) => {
    responseHandler(async () => {
        return "Server is alive.";
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
            const cookie_opts = {
                ...config.cookie.options,
                expires: expireInDays(config.cookie.options.expires),
            };
            const [refresh_token, access_token, email_token] = await accountUsecase.login(role, username, password);

            res.cookie("refresh_token", refresh_token, cookie_opts);
            if (email_token) {
                access_token, email_token;
            }
            return { access_token };
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

router.post(`${prefix}/token`, passport.verifyRefreshToken, async (req, res) => {
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

router.post(`${prefix}/guest/email/confirm/send`, passport.verifyEmail, async (req, res) => {
    responseHandler(async () => {
        const { isConfirmEmail, ...profile } = req.user;
        const { email } = profile;
        if (isConfirmEmail) return `200 : ${email} has been confirmed.`;
        await accountUsecase.sendConfirmEmailAgain(profile);
        return `200 : Done, Message sent to ${email} success. Check your mailbox.`;
    }, res);
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
    if (isConfirmEmail) responseSender(`200 : ${email} has been confirmed.`, res);

    try {
        await accountUsecase.confirmedWithEmail(role, username, email);
        res.redirect(`${config.frontend.base_url}/alert/success`);
    } catch (error) {
        responseSender(new Error(error), res);
    }
});

router.get(`${prefix}/create/service/:service_name`, async (req, res) => {
    responseHandler(async () => {
        const { service_name } = req.params;
        const token_service = await accountUsecase.createService(service_name);
        return { token_service };
    }, res);
});

export default router;
