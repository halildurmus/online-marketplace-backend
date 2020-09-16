// Custom Error class.
class APIError extends Error {
	/**
	 * Default constructor.
	 * @param {int} 		statusCode 			HTTP status code.
	 * @param	{string}	message					Error message.
	 * @param {boolean}	[isOperational] Defaults to true.
	 */
	constructor(statusCode, message, isOperational) {
		super(message)

		this.statusCode = statusCode
		this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
		this.isOperational = isOperational || true

		Error.captureStackTrace(this, this.constructor)
	}
}

module.exports = APIError
