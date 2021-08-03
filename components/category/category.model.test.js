const mongodbHandler = require('../../tests/mongodb-handler')
const Category = require('./category.model')

// Connects to a new in-memory database before running any tests.
beforeAll(async () => await mongodbHandler.connect())

// Clears all test data after every test.
afterEach(async () => await mongodbHandler.clearDatabase())

// Removes and closes the db and server.
afterAll(async () => await mongodbHandler.closeDatabase())

describe('Mongoose Schema Validation', () => {
	it('Should throw a ValidationError while creating a category without name', async () => {
		await expect(
			async () => await Category.create({ name: '' })
		).rejects.toThrow(
			'Category validation failed: name: Path `name` is required.'
		)
	})

	it('Should throw a ValidationError while trying to create a listing with invalid title', async () => {
		await expect(
			async () => await Category.create({ name: 'Te' })
		).rejects.toThrow(
			'Category validation failed: name: Path `name` (`Te`) is shorter than the minimum allowed length (3).'
		)
	})
})
