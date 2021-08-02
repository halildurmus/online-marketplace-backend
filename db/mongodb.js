const connectionOptions = {
	bufferMaxEntries: 0,
	family: 4,
	serverSelectionTimeoutMS: 5000,
	useCreateIndex: true,
	useFindAndModify: false,
	useNewUrlParser: true,
	useUnifiedTopology: true,
}
const logger = require('../utils').loggers.loggerMongodb
const { mongodbUri } = require('../config')
const mongoose = require('mongoose')
mongoose.set('bufferCommands', false)

let maxRetries = 5
const connectWithRetry = () => {
	if (maxRetries > 0) {
		return mongoose.connect(mongodbUri, connectionOptions).catch(() => {
			logger.error(
				`Failed to connect to mongodb on startup. ${maxRetries} tries left. Retrying in 5 sec...`
			)
			// Connection failed, decrease retries counter by 1.
			maxRetries--
			// Try again with 5 seconds later.
			setTimeout(connectWithRetry, 5000)
		})
	}

	logger.info(`💥 Shutting down...`)

	return process.exit(1)
}

mongoose.connection.on('connecting', () => {
	logger.info('Connecting to mongodb.')
})

mongoose.connection.on('connected', () => {
	logger.info('Connected to mongodb.')
})

mongoose.connection.on('open', () => {
	logger.info('Mongodb connection is ready.')
})

mongoose.connection.on('disconnected', () => {
	logger.info('Disconnected from mongodb.')
})

mongoose.connection.on('reconnected', () => {
	logger.info('Reconnected to mongodb.')
})

mongoose.connection.on('error', (err) => {
	logger.error(`${err}`)
})

mongoose.connection.on('close', () => {
	logger.info('Connection to mongodb closed.')
})

module.exports = connectWithRetry()
