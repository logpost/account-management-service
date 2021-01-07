import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./config";

import RedisAdapter from "./adapters/redis.adapter";
import NodeMailerAdapter from "./adapters/nodemailer.adapter";
import AccountRoute from "./routes/account.router";

const app = express();

const port = process.env.PORT || config.app.port;
const base_url = config.app.base_url;
const kind = config.app.kind;

RedisAdapter.getInstance();
NodeMailerAdapter.getInstance();

app.use(cors({ origin: "*", exposedHeaders: ["Set-Cookie"] }));
app.use(cookieParser(config.cookie.secret));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", AccountRoute);

app.listen(port, () => {
    console.log(`Account Management Service 👨🏼‍💻👩🏾‍💻`);
    console.log(`Listening on the ${base_url} 🌟`);
    console.log(`Working on ${kind.toUpperCase()} ENVIRONMENT 👻`);
});
