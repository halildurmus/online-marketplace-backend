const { ApiError } = require('../../helpers')
const mongodbHandler = require('../../tests/mongodb-handler')
const { isValidOperation } = require('./listing.middleware')

// Connects to a new in-memory database before running any tests.
beforeAll(async () => await mongodbHandler.connect())

// Clears all test data after every test.
afterEach(async () => await mongodbHandler.clearDatabase())

// Removes and closes the db and server.
afterAll(async () => await mongodbHandler.closeDatabase())

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
		const req = { body: { views: 1000 } }
		const next = jest.fn()
		const error = new ApiError(400, `Invalid operation!`)

		await isValidOperation(req, {}, next)

		expect(next).toBeCalledWith(error)
	})

	it('Should call the next function if the operation is valid', async () => {
		const req = { body: { title: 'iPhone 12 Pro Max New' } }
		const next = jest.fn()
		const error = new ApiError(400, `Invalid operation!`)

		await isValidOperation(req, {}, next)

		expect(next).toBeCalled()
		expect(next).not.toBeCalledWith(error)
	})
})
