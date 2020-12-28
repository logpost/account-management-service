import redis from "async-redis";
import config from "../config";

class RedisAdapter {
    static instance = null;
    #refreshTokenStore = null;

    #info = {
        port: config.redis.port,
        host: config.redis.host,
        password: config.redis.password,
    };

    constructor() {
        this.#refreshTokenStore = redis.createClient(this.#info);
        this.#refreshTokenStore.on("connect", this.connected);
        this.#refreshTokenStore.on("error", this.error);
    }

    static getInstance() {
        if (!RedisAdapter.instance) RedisAdapter.instance = new RedisAdapter();
        return RedisAdapter.instance;
    }

    connected() {
        console.log("Redis has connected 🎉");
    }

    error(error) {
        console.log("**** error [redis] : ", error);
        throw error;
    }

    disconnect() {
        this.#refreshTokenStore.quit();
        console.log("Redis has disconnected 👻");
    }

    async set(key, value) {
        await this.#refreshTokenStore.set(key, value);
    }

    async del(key) {
        await this.#refreshTokenStore.del(key);
        console.log(`${key} is deleted !`);
    }

    async get(key) {
        return await this.#refreshTokenStore.get(key);
    }

    async exists(key) {
        return await this.#refreshTokenStore.exists(key);
    }
}

export default RedisAdapter;
