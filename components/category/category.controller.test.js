const dbHandler = require('../../tests/db')
const controller = require('./category.controller')

// Connects to a new in-memory database before running any tests.
beforeAll(async () => await dbHandler.connect())

// Clears all test data after every test.
afterEach(async () => await dbHandler.clearDatabase())

// Removes and closes the db and server.
afterAll(async () => await dbHandler.closeDatabase())

describe('createCategory controller', () => {
	it('Should create a category', async () => {
		const category = await controller.createCategory({ name: 'Gaming' })

		expect(category).toMatchObject({})
	})
})

describe('getAllCategories controller', () => {
	it('Should return empty array when there are no categories', async () => {
		const categories = await controller.getAllCategories()

		expect(categories).toStrictEqual([])
	})

	it('Should return all categories', async () => {
		await controller.createCategory({ name: 'Electronics' })
		await controller.createCategory({ name: 'Gaming' })
		await controller.createCategory({
			name: 'Mouse',
			parent: 'Gaming',
		})

		const categories = await controller.getAllCategories()

		expect(Array.isArray(categories)).toBeTruthy()
		expect(categories).toHaveLength(2)
	})
})

describe('getCategories controller', () => {
	it('Should return only parent categories', async () => {
		await controller.createCategory({ name: 'Electronics' })
		await controller.createCategory({ name: 'Gaming' })
		await controller.createCategory({
			name: 'Mouse',
			parent: 'Gaming',
		})

		const categories = await controller.getCategories()

		expect(Array.isArray(categories)).toBeTruthy()
		expect(categories).toHaveLength(2)
	})
})

describe('getCategory controller', () => {
	it('Should throw an APIError while trying to find a category with invalid id', async () => {
		await expect(
			async () => await controller.getCategory('5f785989e8421c13d422f934')
		).rejects.toThrow('Get category failed.')
	})

	it('Should find the category', async () => {
		const category = await controller.createCategory({ name: 'Electronics' })
		const foundCategory = await controller.getCategory(category.id)

		expect(foundCategory).toMatchObject({})
	})
})

describe('getSubcategories controller', () => {
	it('Should throw an APIError while trying to find the subcategories of a category with invalid id', async () => {
		await expect(async () =>
			controller.getSubcategories('5f785989e8421c13d422f934')
		).rejects.toThrow('Get subcategories failed.')
	})

	it('Should find the subcategories of a category', async () => {
		const category = await controller.createCategory({ name: 'Gaming' })
		await controller.createCategory({
			name: 'Keyboard',
			parent: 'Gaming',
		})
		await controller.createCategory({
			name: 'Mouse',
			parent: 'Gaming',
		})
		const foundCategory = await controller.getSubcategories(category.id)

		expect(foundCategory).toMatchObject({})
		expect(foundCategory).toHaveLength(2)
	})
})

describe('removeCategory controller', () => {
	it('Should throw an APIError while trying to remove a category with invalid id', async () => {
		await expect(async () =>
			controller.removeCategory('5f785989e8421c13d422f934')
		).rejects.toThrow('Remove category failed.')
	})

	it('Should remove the categories', async () => {
		const category = await controller.createCategory({ name: 'Gaming' })
		const subcategory = await controller.createCategory({
			name: 'Keyboard',
			parent: 'Gaming',
		})
		const removedCategory = await controller.removeCategory(category.id)
		const removedSubCategory = await controller.removeCategory(subcategory.id)

		expect(removedCategory).toMatchObject({})
		expect(removedSubCategory).toMatchObject({})
	})
})

describe('updateCategory controller', () => {
	it('Should throw an APIError while trying to update a category with invalid id', async () => {
		await expect(async () =>
			controller.updateCategory('5f785989e8421c13d422f934')
		).rejects.toThrow('Update category failed.')
	})

	it('Should update the categories', async () => {
		const category = await controller.createCategory({ name: 'Gaming' })
		const subcategory = await controller.createCategory({
			name: 'Keyboard',
			parent: 'Gaming',
		})
		const updatedCategory = await controller.updateCategory(category.id, {
			name: 'Gaming New',
		})
		const updatedSubCategory = await controller.updateCategory(subcategory.id, {
			name: 'Keyboard New',
		})

		expect(updatedCategory).toMatchObject({})
		expect(updatedSubCategory).toMatchObject({})
	})
})
