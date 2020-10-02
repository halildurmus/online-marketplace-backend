const APIError = require('./APIError')

it('Should create an object of APIError with status code 404', () => {
	const error = new APIError(404, 'Not found')

	expect(error.statusCode).toEqual(404)
	expect(error.status).toEqual('fail')
	expect(error.message).toEqual('Not found')
	expect(error.isOperational).toEqual(true)
})

it('Should create an object of APIError with status code 500', () => {
	const error = new APIError(500, 'Internal server error')

	expect(error.statusCode).toEqual(500)
	expect(error.status).toEqual('error')
	expect(error.message).toEqual('Internal server error')
	expect(error.isOperational).toEqual(true)
})
