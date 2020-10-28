import axios from 'axios'
import config from '../config'

class ShipperAdapter {

    #prefix = config.shipper.api.prefix_route
    #fetcher = axios.create({
        baseURL: config.shipper.api.base_url,
    });
    
    findAccountByUsername = async (username) => {
        try {
            const res = await this.#fetcher.get(`${this.#prefix}/admin/profile/${username}`)
            return res
        } catch (error) {
            return null
        }
    }

    createAccount = async (profile) => {
        try {
            const res = await this.#fetcher.post(`${this.#prefix}/create`, profile)
            return res
        } catch (error) {
            return error.response.data
        }
    }

    confirmedWithEmail = async (username, email) => {
        try {
            const res = await this.#fetcher.put(`${this.#prefix}/confirmed_email`, { identifier: { username }, email })
            return res
        } catch (error) {
            return error.response.data
        }

    }
}

export default new ShipperAdapter()