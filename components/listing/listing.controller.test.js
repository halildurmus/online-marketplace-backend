const mongodbHandler = require('../../tests/mongodb-handler')
const controller = require('./listing.controller')
// Dummy objects.
const listing1 = require('./dummies/listing1.json')
const listing2 = require('./dummies/listing2.json')

// Connects to a new in-memory database before running any tests.
beforeAll(async () => await mongodbHandler.connect())

// Clears all test data after every test.
afterEach(async () => await mongodbHandler.clearDatabase())

// Removes and closes the db and server.
afterAll(async () => await mongodbHandler.closeDatabase())

describe('createListing controller', () => {
	it('Should throw an ApiError while creating a listing without parameters', async () => {
		await expect(async () => await controller.createListing()).rejects.toThrow(
			'You need to provide userId and listing params.'
		)
	})

	it('Should create a listing', async () => {
		const listing = await controller.createListing(
			'5f785989e8421c13d422f934',
			listing1
		)

		expect(listing).toMatchObject({})
	})
})

describe('getListing controller', () => {
	it('Should throw an ApiError while trying to find a listing with invalid id', async () => {
		await expect(
			async () => await controller.getListing('5f785989e8421c13d422f934')
		).rejects.toThrow('The listing not found.')
	})

	it('Should find the listing', async () => {
		const listing = await controller.createListing(
			'5f785989e8421c13d422f934',
			listing1
		)
		const foundListing = await controller.getListing(listing.id)

		expect(foundListing).toMatchObject({})
	})
})

describe('getListings controller', () => {
	it('Should return all listings', async () => {
		await controller.createListing('5f785989e8421c13d422f934', listing1)
		await controller.createListing('5f785989e8421c13d422f934', listing2)

		const listings = await controller.getListings({})

		expect(Array.isArray(listings)).toBeTruthy()
		expect(listings).toHaveLength(2)
	})
})

describe('removeListing controller', () => {
	it('Should throw an ApiError while trying to remove a listing with invalid id', async () => {
		await expect(async () =>
			controller.removeListing('5f785989e8421c13d422f934')
		).rejects.toThrow('The listing not found.')
	})

	it('Should remove the listing', async () => {
		const listing = await controller.createListing(
			'5f785989e8421c13d422f934',
			listing1
		)
		const removedListing = await controller.removeListing(listing.id)

		expect(removedListing).toMatchObject({})
	})
})

describe('updateListing controller', () => {
	it('Should throw an ApiError while trying to update a listing with invalid id', async () => {
		await expect(async () =>
			controller.updateListing('5f785989e8421c13d422f934')
		).rejects.toThrow('The listing not found.')
	})

	it('Should update the listing', async () => {
		const listing = await controller.createListing(
			'5f785989e8421c13d422f934',
			listing1
		)
		const updatedListing = await controller.updateListing(listing.id, {
			name: 'iPhone 12 Pro Max New',
		})

		expect(updatedListing).toMatchObject({})
	})
})
