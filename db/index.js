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
			maxRetries--
			setTimeout(connectWithRetry, 5000)
		})
	} else {
		logger.info(`Shutting down the app.`)

		return process.exit(1)
	}
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

process.on('SIGINT', () => {
	mongoose.disconnect().then(() => {
		logger.info('Shutdown through app termination.')
		process.exit(0)
	})
})

module.exports = connectWithRetry()
module.exports.Listing = require('../components/listing/listing.model')
module.exports.User = require('../components/user/user.model')
module.exports.Types = mongoose.Types
