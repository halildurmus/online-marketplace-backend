require('./utils/uncaughtException')
const app = require('./app')
const logger = require('./utils').loggers.loggerServer
const port = process.env.PORT || 3000

const server = app.listen(port, (err) => {
	if (err) {
		logger.error(`${err}`)
		process.exit(1)
	}
	logger.info(`Server is up on port ${port}.`)
})

process.on('unhandledRejection', (err) => {
	logger.error(`${err.name} ${err.message}`)
	logger.error('UNHANDLED REJECTION! 💥 Shutting down...')
	server.close(() => {
		process.exit(1)
	})
})
