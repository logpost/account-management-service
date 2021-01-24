import * as Profiler from "@google-cloud/profiler";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./config";

import RedisAdapter from "./adapters/redis.adapter";
import NodeMailerAdapter from "./adapters/nodemailer.adapter";
import AccountRoute from "./routes/account.router";

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

app.use(cors(config.cors));
// app.use(cors({ origin: "http://127.0.0.1:3000", credentials: true, exposedHeaders: ["set-cookie"] }));
app.use(cookieParser(config.cookie.secret, config.cookie.options));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", AccountRoute);

app.listen(port, () => {
    console.log(`Account Management Service 👨🏼‍💻👩🏾‍💻`);
    console.log(`Listening on the ${base_url} 🌟`);
    console.log(`Working on ${kind.toUpperCase()} ENVIRONMENT 👻`);
});
