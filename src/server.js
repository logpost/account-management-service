import * as Profiler from "@google-cloud/profiler";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import ExpressSession from "express-session";
import passport from "passport";

import NodeMailerAdapter from "./adapters/nodemailer.adapter";
import RedisAdapter from "./adapters/redis.adapter";
import config from "./config";
import AccountRoute from "./routes/account.router";
import OAuth2Route from "./routes/oauth2.router";

if (process.env.NODE_ENV === "staging") {
    Profiler.start({
        projectId: "logpost-298506",
        serviceContext: {
            service: "account-management-service",
            version: "1.0.0",
        },
    });
}

const app = express();

const port = process.env.PORT || config.app.port;
const base_url = config.app.base_url;
const kind = config.app.kind;

RedisAdapter.getInstance();
NodeMailerAdapter.getInstance();

app.use(ExpressSession({ secret: "logpostsession", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use(cors(config.cors));
// app.use(cors({ origin: "http://127.0.0.1:3000", credentials: true, exposedHeaders: ["set-cookie"] }));
app.use(cookieParser(config.cookie.secret, config.cookie.options));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(AccountRoute);
app.use(OAuth2Route);

app.listen(port, () => {
    console.log(`Account Management Service 👨🏼‍💻👩🏾‍💻`);
    console.log(`Listening on the ${base_url} 🌟`);
    console.log(`Working on ${kind.toUpperCase()} ENVIRONMENT 👻`);
});
