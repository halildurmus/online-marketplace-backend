const dbHandler = require('../../tests/db')
const Category = require('./category.model')

// Connects to a new in-memory database before running any tests.
beforeAll(async () => await dbHandler.connect())

// Clears all test data after every test.
afterEach(async () => await dbHandler.clearDatabase())

// Removes and closes the db and server.
afterAll(async () => await dbHandler.closeDatabase())

it('Should throw a ValidationError while creating a category without name', async () => {
	await expect(async () => await Category.create({ name: '' })).rejects.toThrow(
		'Category validation failed: name: Path `name` is required.'
	)
})
