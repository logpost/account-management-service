import axios from "axios";
import config from "../config";

class ShipperAdapter {
    #prefix = config.shipper.api.prefix_route;
    #fetcher = axios.create({
        baseURL: config.shipper.api.base_url,
        headers: {
            common: {
                Authorization: `bearer ${config.app.token}`,
            },
        },
    });

    adminFindAccountByUsername = async (username) => {
        try {
            const res = await this.#fetcher.get(`${this.#prefix}/srv/profile/${username}`);
            return res;
        } catch (error) {
            return error.response.data;
        }
    };

    createAccount = async (profile) => {
        try {
            const res = await this.#fetcher.post(`${this.#prefix}/srv/create`, profile);
            return res;
        } catch (error) {
            return error.response.data;
        }
    };

    confirmedWithEmail = async (username, email) => {
        try {
            const res = await this.#fetcher.put(`${this.#prefix}/srv/confirmed_email`, {
                identifier: { username },
                email,
            });
            return res;
        } catch (error) {
            return error.response.data;
        }
    };
}

export default new ShipperAdapter();
