const { APIError } = require('../../helpers')
const Category = require('./category.model')
const dbHandler = require('../../tests/db')
const {
	isParentCategoryExists,
	isValidCategoryId,
} = require('./category.middleware')

// Connects to a new in-memory database before running any tests.
beforeAll(async () => await dbHandler.connect())

// Clears all test data after every test.
afterEach(async () => await dbHandler.clearDatabase())

// Removes and closes the db and server.
afterAll(async () => await dbHandler.closeDatabase())

describe('isParentCategoryExists middleware', () => {
	it('Should throw an APIError if the parent category not exists', async () => {
		const req = { body: { parent: 'gaming' } }
		const next = jest.fn()
		const error = new APIError(404, 'Invalid parent category!')

		await isParentCategoryExists(req, {}, next)

		expect(next).toBeCalledWith(error)
	})

	it('Should call the next function if the parent category exists', async () => {
		await Category.create({ name: 'Gaming' })

		const req = { body: { parent: 'gaming' } }
		const next = jest.fn()
		const error = new APIError(404, 'Invalid parent category!')

		await isParentCategoryExists(req, {}, next)

		expect(next).toBeCalled()
		expect(next).not.toBeCalledWith(error)
	})
})

describe('isValidCategoryId middleware', () => {
	it('Should throw an APIError if the category id is invalid', async () => {
		const req = { params: { id: '5f785989e8421c13d422f934' } }
		const next = jest.fn()
		const error = new APIError(404, 'Invalid category id!')

		await isValidCategoryId(req, {}, next)

		expect(next).toBeCalledWith(error)
	})

	it('Should call the next function if the category id is valid', async () => {
		const category = await Category.create({ name: 'Gaming' })

		const req = { params: { id: category.id } }
		const next = jest.fn()
		const error = new APIError(404, 'Invalid category id!')

		await isValidCategoryId(req, {}, next)

		expect(next).toBeCalled()
		expect(next).not.toBeCalledWith(error)
	})
})
