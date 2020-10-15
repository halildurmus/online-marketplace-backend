const dbHandler = require('../../tests/db')
const service = require('./listing.service')
// Dummy listing objects.
const listing1 = require('./dummies/listing1.json')
const listing2 = require('./dummies/listing2.json')

// Connects to a new in-memory database before running any tests.
beforeAll(async () => await dbHandler.connect())

// Clears all test data after every test.
afterEach(async () => await dbHandler.clearDatabase())

// Removes and closes the db and server.
afterAll(async () => await dbHandler.closeDatabase())

async function createListings() {
	await service.createListing('5f785989e8421c13d422f934', listing1)
	await service.createListing('5f785989e8421c13d422f934', listing2)
}

describe('createListing service', () => {
	it('Should create a listing', async () => {
		const listing = await service.createListing(
			'5f785989e8421c13d422f934',
			listing1
		)

		expect(listing.title).toEqual(listing1.title)
		expect(listing.postedBy.toString()).toBe('5f785989e8421c13d422f934')
		expect(listing.videos).toHaveLength(0)
		expect(listing.favorites).toEqual(0)
		expect(listing.views).toEqual(0)
	})
})

describe('getListing service', () => {
	it('Should return undefined if the listing not found', async () => {
		const listing = await service.getListing('5f785989e8421c13d422f934')

		expect(listing).toBeUndefined()
	})

	it('Should return the listing', async () => {
		const listing = await service.createListing(
			'5f785989e8421c13d422f934',
			listing1
		)

		const foundListing = await service.getListing(listing.id)

		expect(foundListing.title).toEqual(listing1.title)
	})
})

describe('getListings service', () => {
	// Clears all test data after every test.
	afterEach(async () => await dbHandler.clearDatabase())

	it('Should return empty array if no listing found', async () => {
		const listings = await service.getListings({}, {}, 0, 0)

		expect(Array.isArray(listings)).toBeTruthy()
		expect(listings).toHaveLength(0)
	})

	it('Should return all listings', async () => {
		await createListings()

		const listings = await service.getListings({}, {}, 0, 0)

		expect(Array.isArray(listings)).toBeTruthy()
		expect(listings).toHaveLength(2)
	})

	it('Should return matching listings', async () => {
		await createListings()

		const listings = await service.getListings({ price: 20000 }, {}, 0, 0)

		expect(Array.isArray(listings)).toBeTruthy()
		expect(listings).toHaveLength(1)
		expect(listings[0].price).toBe(20000)
	})

	it('Should return listings sorted by price ASC', async () => {
		await createListings()

		const listings = await service.getListings({}, { price: 1 }, 0, 0)

		expect(Array.isArray(listings)).toBeTruthy()
		expect(listings).toHaveLength(2)
		expect(listings[0].price).toBe(20000)
		expect(listings[1].price).toBe(25000)
	})

	it('Should return listings sorted by price DESC', async () => {
		await createListings()

		const listings = await service.getListings({}, { price: -1 }, 0, 0)

		expect(Array.isArray(listings)).toBeTruthy()
		expect(listings).toHaveLength(2)
		expect(listings[0].price).toBe(25000)
		expect(listings[1].price).toBe(20000)
	})

	it('Should return the first listing', async () => {
		await createListings()

		const listings = await service.getListings({}, {}, 1, 0)

		expect(Array.isArray(listings)).toBeTruthy()
		expect(listings).toHaveLength(1)
		expect(listings[0].title).toEqual(listing1.title)
	})

	it('Should skip the first listing', async () => {
		await createListings()

		const listings = await service.getListings({}, {}, 0, 1)

		expect(Array.isArray(listings)).toBeTruthy()
		expect(listings).toHaveLength(1)
		expect(listings[0].title).toEqual(listing2.title)
	})
})

describe('removeListing service', () => {
	it('Should return undefined if no listing found', async () => {
		const listing = await service.removeListing('5f785989e8421c13d422f934')

		expect(listing).toBeUndefined()
	})

	it('Should remove the listing', async () => {
		const listing = await service.createListing(
			'5f785989e8421c13d422f934',
			listing1
		)
		const removedListing = await service.removeListing(listing.id)

		expect(removedListing.title).toEqual(listing1.title)
	})
})

describe('updateListing service', () => {
	it('Should return undefined if no listing found', async () => {
		const listing = await service.updateListing('5f785989e8421c13d422f934')

		expect(listing).toBeUndefined()
	})

	it('Should update the listing', async () => {
		const listing = await service.createListing(
			'5f785989e8421c13d422f934',
			listing1
		)
		const updatedListing = await service.updateListing(listing.id, {
			title: 'iPhone 12 Pro Max New',
		})

		expect(updatedListing.title).toEqual('iPhone 12 Pro Max New')
	})
})
