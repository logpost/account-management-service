import express from "express";
import cors from "cors";
import config from "./config";

import NodeMailerAdapter from "./adapters/nodemailer.adapter";
import AccountRoute from "./routes/account.router";

const app = express();
const port = process.env.PORT || config.app.port;
const domain = config.app.domain;

NodeMailerAdapter.getInstance();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", AccountRoute);

app.listen(port, () => {
    console.log(
        `TEST IMAGE => Account Management Service 👨🏼‍💻👩🏾‍💻\nApp listening on the http://${domain}:${port} 🌟`
    );
});
