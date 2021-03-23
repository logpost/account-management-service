import jwt from "jsonwebtoken";

import NodeMailerAdapter from "../adapters/nodemailer.adapter";
import RedisAdapter from "../adapters/redis.adapter";
import config from "../config";
import AccountFactory from "../factorys/account.factory";
import { compareHashed } from "../helper/hashing.handler";
import { createAccessToken, createEmailConfirmToken, createRefreshToken } from "../helper/token.handler";

class AccountUsecase {
    fetcher = new AccountFactory();
    refreshTokenStore = RedisAdapter.getInstance();

    signup = async (role, profile) => {
        try {
            let isOAuth2Signup = false;

            if (profile?.oauth2?.line?.user_id) {
                isOAuth2Signup = true;
                profile.is_email_confirmed = true;
            }

            const res = await this.fetcher.account[role].createAccount(profile);
            console.log(res);
            if (res.status === 200) {
                const { name, email } = profile;
                if (isOAuth2Signup) {
                    return `201 : Signup with OAuth2 successfully.`;
                } else {
                    const email_token = createEmailConfirmToken({ ...profile, role });
                    // console.log(email_token);
                    const transporter = await NodeMailerAdapter.getInstance();
                    transporter.send(name, email, role, email_token, "confirm_email");
                    return { email_token };
                }
            }
        } catch (error) {
            if (error.message) throw new Error(error.message);
            else throw new Error("500 : Adapter isn't alive.");
        }
    };

    login = async (role, username, password) => {
        try {
            const res = await this.fetcher.account[role].findAccountByIdentifier(username, "username");
            if (res) {
                const { data: account } = res;
                if (account) {
                    const authorized = await compareHashed(password, account.password);
                    if (authorized) {
                        const refresh_token = createRefreshToken(account);
                        const access_token = createAccessToken(account);
                        await this.refreshTokenStore.set(refresh_token, username);
                        if (!account.is_email_confirmed) {
                            const email_token = createEmailConfirmToken({ ...account, role });
                            return [refresh_token, access_token, email_token];
                        }
                        return [refresh_token, access_token];
                    }
                    throw new Error("400 : Invalid, password is not match.");
                }
                throw new Error(res.error.message);
            }
        } catch (error) {
            if (error.message) throw new Error(error.message);
            else throw new Error("500 : Adapter isn't alive.");
        }
    };

    OAuth2 = async (profile) => {
        if (profile) {
            const { username } = profile;
            const refresh_token = createRefreshToken(profile);
            const access_token = createAccessToken(profile);
            await this.refreshTokenStore.set(refresh_token, username);
            return [refresh_token, access_token];
        }
        throw new Error(`404 : Your infomation is not valid.`);
    };

    logout = async (refresh_token) => {
        if (await this.refreshTokenStore.exists(refresh_token)) {
            await this.refreshTokenStore.del(refresh_token);
            return "202 : Logout success, Your refresh_token is deleted";
        }
        throw new Error("404 : Your refresh_token is not exist.");
    };

    generateAccessTokenFromRefreshToken = async (account, refresh_token) => {
        // make sure this username is geting from token, didn't fetching from database
        const { username } = account;
        if (
            (await this.refreshTokenStore.exists(refresh_token)) &&
            (await this.refreshTokenStore.get(refresh_token)) === username
        ) {
            const access_token = createAccessToken(account);
            return access_token;
        }
        throw new Error("400 : Your refresh_token is not valid.");
    };

    changePassword = async (profile, data) => {
        const { username, role } = profile;
        const { old_password, password } = data;
        try {
            const res = await this.fetcher.account[role].findAccountByIdentifier(username, "username");
            const { data: account } = res;
            if (account) {
                const authorized = await compareHashed(old_password, account.password);
                if (authorized) {
                    const res = await this.fetcher.account[role].updateAccounProfiletByUsername(
                        { username },
                        { password }
                    );
                    if (res.status === 200) {
                        return `204 : Updated password successfully`;
                    }
                    throw new Error("500 : Adapter isn't alive.");
                }
                throw new Error("400 : Invalid, password is not match.");
            }
            throw new Error("404 : Your account didn't exist.");
        } catch (error) {
            if (error.message) throw new Error(error.message);
            else throw new Error("500 : Adapter isn't alive.");
        }
    };

    sendEmailForChangeEmail = async (profile) => {
        const { name, email, role } = profile;
        const transporter = await NodeMailerAdapter.getInstance();
        const email_token = createEmailConfirmToken(profile);
        transporter.send(name, email, role, email_token, "change_email");
    };

    sendConfirmEmailAgain = async (profile) => {
        const { name, email, role } = profile;
        const transporter = await NodeMailerAdapter.getInstance();
        const email_token = createEmailConfirmToken(profile);
        transporter.send(name, email, role, email_token, "confirm_email");
    };

    changeEmailWithEmail = async (role, username, email) => {
        try {
            const res = await this.fetcher.account[role].findAccountByIdentifier(username, "username");
            const { data: account } = res;
            if (account) {
                const res = await this.fetcher.account[role].updateAccounProfiletByUsername({ username }, { email });
                if (res.status === 200) {
                    return `204 : Updated email successfully`;
                }
                throw new Error("500 : Adapter isn't alive.");
            }
            throw new Error("404 : Your account didn't exist.");
        } catch (error) {
            if (error.message) throw new Error(error.message);
            else throw new Error("500 : Adapter isn't alive.");
        }
    };

    confirmedWithEmail = async (role, username) => {
        const res = await this.fetcher.account[role].confirmedWithEmail(username);
        return res;
    };

    findAccountByIdentifier = async (role, identifier, field) => {
        const res = await this.fetcher.account[role].findAccountByIdentifier(identifier, field);
        return res;
    };

    createService = async (service_name) => {
        const payload = { username: service_name, isConfirmEmail: true, role: "srv" };
        const claims = {
            issuer: service_name,
            audience: service_name,
            subject: service_name,
        };
        const secret = config.jwt.access_token.secret.jwt_secret;
        return jwt.sign(payload, secret, claims);
    };
}

export default AccountUsecase;
