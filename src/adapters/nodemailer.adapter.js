import nodemailer from "nodemailer";
import config from "../config";
import templateConfirmEmail from "../template/email.confirmed.template";
import templateChangeEmail from "../template/email.change_email.template";
class NodeMailerAdapter {
    static instance = null;

    #transporter = null;
    #transport_info = null;

    #account = {
        user: config.nodemailer.auth.gmail.username,
        pass: config.nodemailer.auth.gmail.password,
    };

    #mailpayload = {
        confirm_email: {
            info: {
                from: '"Logpost platform รวมงานขนส่ง 👻" <logpost.bot@gmail.com>', // sender address
                to: "bar@example.com, baz@example.com", // list of receivers
                subject: "ยืนยันอีเมลของคุณ ✔", // Subject line
                // text: "Hello world?", // plain text body
                html: "<b>Hello world?</b>", // html body
            },
            template: templateConfirmEmail,
        },
        change_email: {
            info: {
                from: '"Logpost platform รวมงานขนส่ง 👻" <logpost.bot@gmail.com>', // sender address
                to: "bar@example.com, baz@example.com", // list of receivers
                subject: "ยืนยันการเปลี่ยนแปลงอีเมลของคุณ", // Subject line
                // text: "Hello world?", // plain text body
                html: "<b>Hello world?</b>", // html body
            },
            template: templateChangeEmail,
        },
    };

    constructor() {
        this.connect();
    }

    static getInstance() {
        if (!NodeMailerAdapter.instance) NodeMailerAdapter.instance = new NodeMailerAdapter();
        return NodeMailerAdapter.instance;
    }

    connect = async () => {
        this.#transport_info = {
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            service: "gmail",
            auth: {
                user: this.#account.user, // generated ethereal user
                pass: this.#account.pass, // generated ethereal password
            },
        };

        this.#transporter = nodemailer.createTransport(this.#transport_info);
        console.log("NodeMailer: transporter is ready ✉️");
    };

    send = async (name, email, role, email_token, type = "confirm_email") => {
        let info = await this.#transporter.sendMail({
            ...this.#mailpayload[type].info,
            html: this.#mailpayload[type].template(name, email, role, email_token),
            to: email,
        });
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        this.logging(info);
    };

    logging = (info) => {
        console.log("Message sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    };
}

export default NodeMailerAdapter;
