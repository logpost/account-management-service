import jwt from "jsonwebtoken";
import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import LineStrategy from "passport-line-auth";

import config from "../config";
import AccountUsecase from "../usecase/account.usecase";

const accountUsecase = new AccountUsecase();

const cookieRefreshTokenExtractor = (req) => {
    var token = null;
    if (req && req.signedCookies) {
        token = req.signedCookies["refresh_token"];
    }
    return token;
};

const options_email_rule = {
    jwtFromRequest: ExtractJwt.fromUrlQueryParameter("email_token"),
    secretOrKey: config.jwt.email_token.secret.jwt_secret,
    issuer: config.jwt.email_token.options.issuer,
    audience: config.jwt.email_token.options.audience,
};

const options_auth_rule = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwt.access_token.secret.jwt_secret,
    issuer: config.jwt.access_token.options.issuer,
    audience: config.jwt.access_token.options.audience,
};

const options_refresh_rule = {
    jwtFromRequest: cookieRefreshTokenExtractor,
    secretOrKey: config.jwt.refresh_token.secret.jwt_secret,
    issuer: config.jwt.refresh_token.options.issuer,
    audience: config.jwt.refresh_token.options.audience,
};

const verifyStrategyLINE = async (req, accessToken, refreshToken, params, profile, done) => {
    const { role } = req.params;
    const { email } = jwt.decode(params.id_token);
    profile.email = email;

    try {
        if (role && email) {
            const { data: account } = await accountUsecase.findAccountByIdentifier(role, email, "email");
            if (account) {
                console.log(account);
                if (account.oauth2.line.user_id === profile.id) {
                    // account exist and sync with LINE oauth2
                    return done(null, { ...profile, ...account, isAccountExist: true, isAccountSyncOAuth2: true });
                }
                // account exist and not sync with LINE oauth2
                return done(null, { ...profile, isAccountExist: true, isAccountSyncOAuth2: false });
            }
            // account not exist
            return done(null, { ...profile, isAccountExist: false, isAccountSyncOAuth2: false });
        }
        return done(null, false);
    } catch (error) {
        console.log(error);
        return done(error, false);
    }
};

passport.use(
    "email_rule",
    new Strategy(options_email_rule, async (payload, done) => {
        try {
            const { username, role } = payload;
            const { data: account } = await accountUsecase.findAccountByIdentifier(role, username, "username");
            if (account) return done(null, payload);
            return done(null, false);
        } catch (error) {
            console.log(error);
            return done(error, false);
        }
    })
);

passport.use(
    "auth_rule",
    new Strategy(options_auth_rule, async (payload, done) => {
        try {
            const { username, role } = payload;
            const { data: account } = await accountUsecase.findAccountByIdentifier(role, username, "username");

            if (account) {
                const user = {
                    isConfirmEmail: false,
                    ...account,
                    role,
                };

                if (account.is_email_confirmed) user.isConfirmEmail = true;
                return done(null, user);
            }
            return done(null, false);
        } catch (error) {
            return done(error, false);
        }
    })
);

passport.use(
    "refresh_rule",
    new Strategy(options_refresh_rule, async (payload, done) => {
        try {
            const { role, username } = payload;
            const { data: account } = await accountUsecase.findAccountByIdentifier(role, username, "username");
            // we have to replace username's sotring in database with username's storing in token,
            // then next step use-case will verify the username is matching on Redis
            // (that protect when secret variable for create token is hacked)
            if (account) return done(null, { ...account, username });
            return done(null, false);
        } catch (error) {
            return done(error, false);
        }
    })
);

passport.use(
    "line_rule_shipper",
    new LineStrategy({ ...config.oauth2.LINE, callbackURL: config.oauth2.LINE.callbackURL.shipper }, verifyStrategyLINE)
);
passport.use(
    "line_rule_carrier",
    new LineStrategy({ ...config.oauth2.LINE, callbackURL: config.oauth2.LINE.callbackURL.carrier }, verifyStrategyLINE)
);

export default {
    verifyAuth: passport.authenticate("auth_rule", { session: false }),
    verifyEmail: passport.authenticate("email_rule", { session: false }),
    verifyRefreshToken: passport.authenticate("refresh_rule", { session: false }),
    verifyOAuthLine: (req, res, next) => {
        passport.authenticate(req.params.role === "shipper" ? "line_rule_shipper" : "line_rule_carrier", {
            failureRedirect: "/",
            session: false,
        })(req, res, next);
    },
};
