const dbHandler = require('../../tests/db')
const controller = require('./listing.controller')
const redis = require('../../db/redis')
// Dummy listing objects.
const listing1 = require('./dummies/listing1.json')
const listing2 = require('./dummies/listing2.json')

// Connects to a new in-memory database before running any tests.
beforeAll(async () => await dbHandler.connect())

// Clears all test data after every test.
afterEach(async () => await dbHandler.clearDatabase())

// Removes and closes the db and server.
afterAll(async () => await dbHandler.closeDatabase())

describe('createListing controller', () => {
	it('Should create a listing', async () => {
		const listing = await controller.createListing(
			'5f785989e8421c13d422f934',
			listing1
		)

		expect(listing).toMatchObject({})
	})
})

describe('getListing controller', () => {
	it('Should throw an APIError while trying to find a listing with invalid id', async () => {
		await expect(
			async () => await controller.getListing('5f785989e8421c13d422f934')
		).rejects.toThrow('Get listing failed.')
	})

	it('Should find the listing', async () => {
		const mockRedisHincrby = jest
			.spyOn(redis, 'hincrby')
			.mockReturnValueOnce(true)
		const listing = await controller.createListing(
			'5f785989e8421c13d422f934',
			listing1
		)
		const foundListing = await controller.getListing(listing.id)

		expect(foundListing).toMatchObject({})
		mockRedisHincrby.mockRestore()
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
	it('Should throw an APIError while trying to remove a listing with invalid id', async () => {
		await expect(async () =>
			controller.removeListing('5f785989e8421c13d422f934')
		).rejects.toThrow('Remove listing failed.')
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
	it('Should throw an APIError while trying to update a listing with invalid id', async () => {
		await expect(async () =>
			controller.updateListing('5f785989e8421c13d422f934')
		).rejects.toThrow('Update listing failed.')
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
