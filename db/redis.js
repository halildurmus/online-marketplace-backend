const logger = require('../utils').loggers.loggerRedis
const { redisUri } = require('../config')
const Redis = require('ioredis')
const redis = new Redis(redisUri)

redis.on('connect', () => {
	logger.info('Connected to redis.')
})

redis.on('ready', () => {
	logger.info('Redis connection is ready.')
})

redis.on('error', (err) => {
	logger.error(`Couldn't connect to redis. ${err.message}`)
})

redis.on('close', () => {
	logger.info('Connection to redis closed.')
})

redis.on('reconnecting', () => {
	logger.info('Trying to reconnect to redis.')
})

redis.on('end', () => {
	logger.info('Disconnected from redis.')
})

module.exports = redis
