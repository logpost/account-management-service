import jwt from "jsonwebtoken";
import RedisAdapter from "../adapters/redis.adapter";
import NodeMailerAdapter from "../adapters/nodemailer.adapter";
import AccountFactory from "../factorys/account.factory";
import config from "../config";

import { compareHashed } from "../helper/hashing.handler";

import { createEmailConfirmToken, createAccessToken, createRefreshToken } from "../helper/token.handler";
class AccountUsecase {
    fetcher = new AccountFactory();
    refreshTokenStore = RedisAdapter.getInstance();

    signup = async (role, profile) => {
        const res = await this.fetcher.account[role].createAccount(profile);
        if (res.status === 200) {
            const { name, email } = profile;
            const email_token = await createEmailConfirmToken({ ...profile, role });

            const transporter = await NodeMailerAdapter.getInstance();
            transporter.send(name, email, role, email_token);
            return { email_token };
        }
        throw new Error(res.error.message);
    };

    login = async (role, username, password) => {
        const res = await this.fetcher.account[role].adminFindAccountByUsername(username);
        const { data: account } = res;
        if (account) {
            const authorized = await compareHashed(password, account.password);
            if (authorized) {
                const refresh_token = await createRefreshToken(account);
                const access_token = await createAccessToken(account);
                await this.refreshTokenStore.set(refresh_token, username);
                return [refresh_token, access_token];
            }
            throw new Error("400 : Invalid, password is not match.");
        }
        throw new Error(res.error.message);
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
            const access_token = await createAccessToken(account);
            return access_token;
        }
        throw new Error("400 : Your refresh_token is not valid.");
    };

    adminFindAccountByUsername = async (role, username) => {
        const res = await this.fetcher.account[role].adminFindAccountByUsername(username);
        return res;
    };

    sendConfirmEmailAgain = async (profile) => {
        const { name, email, role } = profile;
        const transporter = await NodeMailerAdapter.getInstance();
        const email_token = await createEmailConfirmToken(profile);
        transporter.send(name, email, role, email_token);
    };

    confirmedWithEmail = async (role, username, email) => {
        const res = await this.fetcher.account[role].confirmedWithEmail(username, email);
        return res;
    };

    createService = async (service_name) => {
        const payload = { username: service_name };
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
