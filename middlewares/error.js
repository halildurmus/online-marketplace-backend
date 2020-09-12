const { nodeEnv } = require('../config')
const { APIError, loggers } = require('../utils')
const httpStatus = require('http-status')
const logger = loggers.loggerServer

const sendErrorDev = (err, res) => {
	logger.error('ERROR 💥:', err)

	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack,
	})
}

const sendErrorProd = (err, res) => {
	// Operational, trusted error: sends message to client.
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		})

		// Programming or other unknown error.
	} else if (err.isOperational === false) {
		// 1) Logs error.
		logger.error('ERROR 💥:', err)

		// 2) Sends generic response.
		res.status(500).json({
			status: 'error',
			message: 'Something went very wrong!',
		})
	}
}

// Custom error handler.
exports.handler = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500
	err.status = err.status || 'error'

	if (nodeEnv === 'development') {
		sendErrorDev(err, res)
	} else if (nodeEnv === 'production') {
		sendErrorProd(err, res)
	}
}

// If the error is not an instanceOf APIError, convert it.
exports.converter = (err, req, res, next) => {
	let convertedError = err

	if (!(err instanceof APIError)) {
		convertedError = new APIError(err.statusCode, err.message)
	}

	return exports.handler(convertedError, req, res)
}

// Catch 404 and forward to error handler.
exports.notFound = (req, res, next) => {
	const statusCode = httpStatus.NOT_FOUND
	const message = `${req.url} Route ${httpStatus['404']}`
	const err = new APIError(statusCode, message)

	return exports.handler(err, req, res)
}
