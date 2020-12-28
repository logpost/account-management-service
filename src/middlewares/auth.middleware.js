import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import AccountUsecase from "../usecase/account.usecase";
import config from "../config";
// import { checkAccountDidConfirmEmail } from "../helper/policy.handler";

const accountUsecase = new AccountUsecase();

var cookieRefreshTokenExtractor = function (req) {
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

passport.use(
    "email_rule",
    new Strategy(options_email_rule, async (payload, done) => {
        try {
            const { username, role } = payload;
            const { data: account } = await accountUsecase.adminFindAccountByUsername(role, username);

            if (account) return done(null, payload);
            // this case its not test yet !!!!
            return done(null, false);
        } catch (error) {
            return done(error, false);
        }
    })
);

passport.use(
    "auth_rule",
    new Strategy(options_auth_rule, async (payload, done) => {
        try {
            const { username, role } = payload;
            const { data: account } = await accountUsecase.adminFindAccountByUsername(role, username);

            if (account) {
                const user = {
                    isConfirmEmail: false,
                    shipper_id: account._id,
                    username: account.username,
                    name: account.name,
                    display_name: account.display_name,
                    email: account.email,
                    account_type: account.account_type,
                    role,
                };

                if (account.email !== "not_confirm") user.isConfirmEmail = true;

                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (error) {
            return done(error, false);
        }
    })
);

passport.use(
    "refresh_rule",
    new Strategy(options_refresh_rule, async (payload, done) => {
        try {
            const { username, role } = payload;
            const { data: account } = await accountUsecase.adminFindAccountByUsername(role, username);
            if (account) return done(null, account);
            return done(null, false);
        } catch (error) {
            return done(error, false);
        }
    })
);

export default {
    verifyAuth: passport.authenticate("auth_rule", { session: false }),
    verifyEmail: passport.authenticate("email_rule", { session: false }),
    verifyRefreshToken: passport.authenticate("refresh_rule", { session: false }),
};
