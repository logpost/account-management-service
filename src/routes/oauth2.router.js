import express from "express";

import config from "../config";
import { cookieOptions } from "../helper/cookie.handler";
import { convertOjectToQuerys, responseSender } from "../helper/response.handler";
import passport from "../middlewares/auth.middleware";
import AccountUsecase from "../usecase/account.usecase";

const prefix = "/oauth2";
const router = express.Router();

const accountUsecase = new AccountUsecase();

router.get(`${prefix}/login/line/:role`, passport.verifyOAuthLine);

router.get(`${prefix}/login/line/callback/:role`, passport.verifyOAuthLine, async (req, res) => {
    const { isAccountExist, isAccountSyncOAuth2, ...profile } = req.user;
    const { id, email, displayName } = profile;
    console.log(profile, isAccountExist, isAccountSyncOAuth2);
    try {
        if (isAccountExist) {
            if (isAccountSyncOAuth2) {
                const [refresh_token, access_token] = await accountUsecase.OAuth2(profile);
                if (refresh_token && access_token) {
                    res.cookie("refresh_token", refresh_token, cookieOptions);
                    responseSender({ access_token }, res);
                    return;
                }
                responseSender(new Error("500 : Account service isn't alive."), res);
                return;
            }
        } else {
            if (profile) {
                const querys = convertOjectToQuerys({ user_id: id, display_name: displayName, email });
                res.redirect(`${config.frontend.base_url}/signup?${querys}`);
                return;
            }
        }
        res.redirect(`${config.frontend.base_url}/signup?errorCode=100`);
    } catch (error) {
        console.log(error.message);
        res.redirect(`${config.frontend.base_url}/login?errorCode=100`);
    }
});

export default router;
