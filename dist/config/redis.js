"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = void 0;
const redis_1 = require("redis");
const env_1 = require("./env");
const log_util_1 = require("../logger/log.util");
const redisClient = (0, redis_1.createClient)({ url: env_1.env.REDIS_URL });
redisClient.on('connect', () => (0, log_util_1.logInfo)('Redis connected'));
redisClient.on('error', (err) => (0, log_util_1.logError)('Redis error', err));
const connectRedis = async () => {
    if (!redisClient.isOpen)
        await redisClient.connect();
};
exports.connectRedis = connectRedis;
exports.default = redisClient;
