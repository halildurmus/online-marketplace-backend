const { APIError } = require('../../helpers')
const Listing = require('./listing.model')
const dbHandler = require('../../tests/db')
const { isValidListingId, isValidOperation } = require('./listing.middleware')
const listing1 = require('./dummies/listing1.json')

// Connects to a new in-memory database before running any tests.
beforeAll(async () => await dbHandler.connect())

// Clears all test data after every test.
afterEach(async () => await dbHandler.clearDatabase())

// Removes and closes the db and server.
afterAll(async () => await dbHandler.closeDatabase())

describe('isValidListingId middleware', () => {
	it('Should throw an APIError if the listing not exists', async () => {
		const req = { body: { id: '5f785989e8421c13d422f934' } }
		const next = jest.fn()
		const error = new APIError(404, 'Invalid listing id!')

		await isValidListingId(req, {}, next)

		expect(next).toBeCalledWith(error)
	})

	it('Should call the next function if the listing exists', async () => {
		const listing = await Listing.create({
			postedBy: '5f785989e8421c13d422f934',
			...listing1,
		})

		const req = { body: { id: listing.id } }
		const next = jest.fn()
		const error = new APIError(404, 'Invalid listing id!')

		await isValidListingId(req, {}, next)

		expect(next).toBeCalled()
		expect(next).not.toBeCalledWith(error)
	})
})

describe('isValidOperation middleware', () => {
	it('Should throw an APIError if the operation is invalid', async () => {
		const req = { body: { views: 1000 } }
		const next = jest.fn()
		const error = new APIError(400, `Invalid operation!`)

		await isValidOperation(req, {}, next)

		expect(next).toBeCalledWith(error)
	})

	it('Should call the next function if the operation is valid', async () => {
		const req = { body: { title: 'iPhone 12 Pro Max New' } }
		const next = jest.fn()
		const error = new APIError(400, `Invalid operation!`)

		await isValidOperation(req, {}, next)

		expect(next).toBeCalled()
		expect(next).not.toBeCalledWith(error)
	})
})
