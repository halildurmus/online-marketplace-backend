const { nodeEnv } = require('../config')
const { format, loggers, transports } = require('winston')
const { colorize, combine, json, printf, timestamp } = format
const loggerOptions = (service) => {
	return {
		level: 'info',
		format: combine(
			timestamp({
				format: 'YYYY-MM-DD HH:mm:ss',
			}),
			json()
		),
		defaultMeta: { service },
		transports: [
			// - Write all logs with level `error` and below to `error.log`.
			// - Write all logs with level `info` and below to `combined.log`.
			new transports.File({
				filename: './logs/error.log',
				level: 'error',
			}),
			new transports.File({ filename: './logs/combined.log' }),
		],
	}
}

const loggerMongodb = loggers.add('mongodb', loggerOptions('mongodb'))
const loggerServer = loggers.add('server', loggerOptions('server'))

// Custom format for logging to the `console`.
const myFormat = printf(({ level, message, service, timestamp }) => {
	return `${timestamp} ${level}: ${message} [${service}]`
})

// Log to the `console` if we're not in production.
if (nodeEnv !== 'production') {
	const transportConsole = new transports.Console({
		format: combine(timestamp(), colorize(), myFormat),
	})
	loggerMongodb.add(transportConsole)
	loggerServer.add(transportConsole)
}

module.exports.loggerMongodb = loggers.get('mongodb')
module.exports.loggerRedis = loggers.get('redis')
module.exports.loggerServer = loggers.get('server')
