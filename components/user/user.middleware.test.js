const { ApiError } = require('../../helpers')
const dbHandler = require('../../tests/db')
const { isValidOperation } = require('./user.middleware')

// Connects to a new in-memory database before running any tests.
beforeAll(async () => await dbHandler.connect())

// Clears all test data after every test.
afterEach(async () => await dbHandler.clearDatabase())

// Removes and closes the db and server.
afterAll(async () => await dbHandler.closeDatabase())

describe('isValidOperation middleware', () => {
	it('Should throw an ApiError if the fields to be updated not provided', async () => {
		const req = { body: {} }
		const next = jest.fn()
		const error = new ApiError(
			404,
			'You need to provide the fields to be updated!'
		)

		await isValidOperation(req, {}, next)

		expect(next).toBeCalledWith(error)
	})

	it('Should throw an ApiError if the operation is invalid', async () => {
		const req = { body: { role: 'admin' } }
		const next = jest.fn()
		const error = new ApiError(400, `Invalid operation!`)

		await isValidOperation(req, {}, next)

		expect(next).toBeCalledWith(error)
	})

	it('Should call the next function if the operation is valid', async () => {
		const req = { body: { firstName: 'Test' } }
		const next = jest.fn()
		const error = new ApiError(400, `Invalid operation!`)

		await isValidOperation(req, {}, next)

		expect(next).toBeCalled()
		expect(next).not.toBeCalledWith(error)
	})
})
