const util = require('util');
const redis = require('redis');

const {
    REDIS_DATABASE_URL,
    REDIS_DATABASE_PORT,
} = process.env


const redisClient = redis.createClient({
    socket: {
        host: REDIS_DATABASE_URL,
        port: REDIS_DATABASE_PORT
    }
});

redisClient.get = util.promisify(redisClient.get);

module.exports = {redisClient}