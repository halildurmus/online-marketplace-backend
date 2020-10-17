const dbHandler = require('../../tests/db')
const service = require('./category.service')

// Connects to a new in-memory database before running any tests.
beforeAll(async () => await dbHandler.connect())

// Clears all test data after every test.
afterEach(async () => await dbHandler.clearDatabase())

// Removes and closes the db and server.
afterAll(async () => await dbHandler.closeDatabase())

describe('createCategory service', () => {
	// Clears all test data after every test.
	afterEach(async () => await dbHandler.clearDatabase())

	it('Should create a category', async () => {
		const category = await service.createCategory({ name: 'Gaming' })

		expect(category).toMatchObject({
			category: '/gaming',
			name: 'Gaming',
			parent: '/',
		})
	})

	it('Should create a subcategory', async () => {
		const category = await service.createCategory({
			name: 'Mouse',
			parent: 'Gaming',
		})

		expect(category).toMatchObject({
			category: '/gaming/mouse',
			name: 'Mouse',
			parent: '/gaming',
		})
	})
})

describe('getAllCategories service', () => {
	it('Should return empty array if no categories found', async () => {
		const categories = await service.getAllCategories()

		expect(Array.isArray(categories)).toBeTruthy()
		expect(categories).toHaveLength(0)
	})

	it('Should return all categories', async () => {
		await service.createCategory({ name: 'Electronics' })
		await service.createCategory({ name: 'Gaming' })
		await service.createCategory({
			name: 'Mouse',
			parent: 'Gaming',
		})

		const categories = await service.getAllCategories()

		expect(categories).toMatchObject([
			{
				category: {
					category: '/electronics',
					name: 'Electronics',
					parent: '/',
				},
				subcategories: [],
			},
			{
				category: {
					category: '/gaming',
					name: 'Gaming',
					parent: '/',
				},
				subcategories: [
					{
						category: '/gaming/mouse',
						name: 'Mouse',
						parent: '/gaming',
					},
				],
			},
		])
	})
})

describe('getCategories service', () => {
	it('Should return empty array if no categories found', async () => {
		const categories = await service.getCategories()

		expect(Array.isArray(categories)).toBeTruthy()
		expect(categories).toHaveLength(0)
	})

	it('Should return all parent categories', async () => {
		await service.createCategory({ name: 'Electronics' })
		await service.createCategory({ name: 'Gaming' })
		await service.createCategory({
			name: 'Mouse',
			parent: 'Gaming',
		})

		const categories = await service.getCategories()

		expect(categories).toMatchObject([
			{
				category: '/electronics',
				name: 'Electronics',
				parent: '/',
			},
			{
				category: '/gaming',
				name: 'Gaming',
				parent: '/',
			},
		])
	})
})

describe('getCategory service', () => {
	it('Should return undefined if no category found', async () => {
		const category = await service.getCategory('5f785989e8421c13d422f934')

		expect(category).toBeUndefined()
	})

	it('Should find the category', async () => {
		const category = await service.createCategory({ name: 'Electronics' })
		const foundCategory = await service.getCategory(category.id)

		expect(foundCategory).toMatchObject({ name: 'Electronics' })
	})
})

describe('getSubcategories service', () => {
	it('Should return undefined if no category found', async () => {
		const category = await service.getSubcategories('5f785989e8421c13d422f934')

		expect(category).toBeUndefined()
	})

	it('Should find the subcategories of a category', async () => {
		const category = await service.createCategory({ name: 'Gaming' })
		await service.createCategory({
			name: 'Keyboard',
			parent: 'Gaming',
		})
		await service.createCategory({
			name: 'Mouse',
			parent: 'Gaming',
		})
		const foundCategory = await service.getSubcategories(category.id)

		expect(foundCategory).toMatchObject([
			{
				category: '/gaming/keyboard',
				name: 'Keyboard',
				parent: '/gaming',
			},
			{
				category: '/gaming/mouse',
				name: 'Mouse',
				parent: '/gaming',
			},
		])
	})
})

describe('removeCategory service', () => {
	it('Should return undefined if no category found', async () => {
		const category = await service.removeCategory('5f785989e8421c13d422f934')

		expect(category).toBeUndefined()
	})

	it('Should remove the categories', async () => {
		const category = await service.createCategory({ name: 'Gaming' })
		const subcategory = await service.createCategory({
			name: 'Keyboard',
			parent: 'Gaming',
		})
		const removedCategory = await service.removeCategory(category.id)
		const removedSubCategory = await service.removeCategory(subcategory.id)

		expect(removedCategory).toMatchObject({ name: 'Gaming' })
		expect(removedSubCategory).toMatchObject({ name: 'Keyboard' })
	})
})

describe('updateCategory service', () => {
	it('Should return undefined if no category found', async () => {
		const category = await service.updateCategory('5f785989e8421c13d422f934')

		expect(category).toBeUndefined()
	})

	it('Should update the categories', async () => {
		const category = await service.createCategory({ name: 'Gaming' })
		const subcategory = await service.createCategory({
			name: 'Keyboard',
			parent: 'Gaming',
		})
		const updatedCategory = await service.updateCategory(category.id, {
			name: 'Gaming New',
		})
		const updatedSubCategory = await service.updateCategory(subcategory.id, {
			name: 'Keyboard New',
		})

		expect(updatedCategory).toMatchObject({ name: 'Gaming New' })
		expect(updatedSubCategory).toMatchObject({ name: 'Keyboard New' })
	})
})
