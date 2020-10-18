const dbHandler = require('../../tests/db')
const Listing = require('./listing.model')
const User = require('../user/user.model')
const userService = require('../user/user.service')
// Dummy objects.
const listing1 = require('./dummies/listing1.json')
const user1 = require('../user/dummies/user1.json')

// Connects to a new in-memory database before running any tests.
beforeAll(async () => await dbHandler.connect())

// Clears all test data after every test.
afterEach(async () => await dbHandler.clearDatabase())

// Removes and closes the db and server.
afterAll(async () => await dbHandler.closeDatabase())

describe('Mongoose Schema Validation', () => {
	// Clears all test data after every test.
	afterEach(async () => await dbHandler.clearDatabase())

	it('Should throw a ValidationError while trying to create a listing without parameters', async () => {
		await expect(async () => await Listing.create({})).rejects.toThrow(
			'Listing validation failed: location.coordinates: Path `location.coordinates` is required., location.type: Path `location.type` is required., photos.cover: Path `photos.cover` is required., currency: Path `currency` is required., price: Path `price` is required., category: Path `category` is required., description: Path `description` is required., title: Path `title` is required., postedBy: Path `postedBy` is required.'
		)
	})

	it('Should throw a ValidationError while trying to create a listing with invalid title', async () => {
		const user = await User.create(user1)
		const listing = { ...listing1 }
		listing.postedBy = user.id
		listing.title = 'Te'

		await expect(async () => await Listing.create(listing)).rejects.toThrow(
			'Listing validation failed: title: Path `title` (`Te`) is shorter than the minimum allowed length (3).'
		)

		listing.title =
			'Test test test test test test test Test test test test test test test t'

		await expect(async () => await Listing.create(listing)).rejects.toThrow(
			'Listing validation failed: title: Path `title` (`Test test test test test test test Test test test test test test test t`) is longer than the maximum allowed length (70).'
		)
	})

	it('Should throw a ValidationError while trying to create a listing with invalid description', async () => {
		const user = await User.create(user1)
		const listing = { ...listing1 }
		listing.postedBy = user.id
		listing.description = 'Te'

		await expect(async () => await Listing.create(listing)).rejects.toThrow(
			'Listing validation failed: description: Path `description` (`Te`) is shorter than the minimum allowed length (3).'
		)

		listing.description =
			'Test test test test test test test Test test test test test test test test test test test test test Test test test test test test test Test test test test test test test test test test test test test Test test test test test test test Test test test test test test test test test test test test test Test test test test test test test Test test test test test test test test test test test test test Test test test test test test test Test test test test test test test test test test test test test Test test test test test test test Test test test test test test test test test test test test test Test test test test test test test Test test test test test test test test test test test test test Test test test test test test test Test test test test test test test test test test test test test Test test test test test test test Test test test test test test test test test test test test test Test test test test test test test Test test test test test test test test test test test test test t'

		await expect(async () => await Listing.create(listing)).rejects.toThrow(
			'Listing validation failed: description: Path `description` (`Test test test test test test test Test test test test test test test test test test test test test Test test test test test test test Test test test test test test test test test test test test test Test test test test test test test Test test test test test test test test test test test test test Test test test test test test test Test test test test test test test test test test test test test Test test test test test test test Test test test test test test test test test test test test test Test test test test test test test Test test test test test test test test test test test test test Test test test test test test test Test test test test test test test test test test test test test Test test test test test test test Test test test test test test test test test test test test test Test test test test test test test Test test test test test test test test test test test test test Test test test test test test test Test test test test test test test test test test test test test t`) is longer than the maximum allowed length (1000).'
		)
	})

	it('Should throw a ValidationError while trying to create a listing with negative price value', async () => {
		const user = await User.create(user1)
		const listing = { ...listing1 }
		listing.postedBy = user.id
		listing.price = -500

		await expect(async () => await Listing.create(listing)).rejects.toThrow(
			'Listing validation failed: price: Path `price` (-500) is less than minimum allowed value (0)'
		)
	})

	it('Should throw a ValidationError while trying to create a listing with invalid currency', async () => {
		const user = await User.create(user1)
		const listing = { ...listing1 }
		listing.postedBy = user.id
		listing.currency = 'TRYY'

		await expect(async () => await Listing.create(listing)).rejects.toThrow(
			'Listing validation failed: currency: Path `currency` (`TRYY`) is longer than the maximum allowed length (3).'
		)
	})

	it('Should throw a ValidationError while trying to create a listing with invalid condition', async () => {
		const user = await User.create(user1)
		const listing = { ...listing1 }
		listing.postedBy = user.id
		listing.condition = 'Test'

		await expect(async () => await Listing.create(listing)).rejects.toThrow(
			'Listing validation failed: condition: `Test` is not a valid enum value for path `condition`.'
		)
	})

	it('Should throw a ValidationError while trying to create a listing with invalid location', async () => {
		const user = await User.create(user1)
		const listing = { ...listing1 }
		listing.postedBy = user.id
		listing.location = {
			type: 'Test',
			coordinates: listing1.location.coordinates,
		}

		await expect(async () => await Listing.create(listing)).rejects.toThrow(
			'Listing validation failed: location.type: `Test` is not a valid enum value for path `location.type`.'
		)
	})
})

describe('Mongoose Middleware', () => {
	// Clears all test data after every test.
	afterEach(async () => await dbHandler.clearDatabase())

	it(`Should save listing's reference to the user who posted it`, async () => {
		const user = await User.create(user1)
		const listing = await Listing.create({ postedBy: user.id, ...listing1 })
		const res = await User.findById(user.id)

		expect(res.listings[0].toString()).toEqual(listing.id)
	})

	it(`Should remove listing's reference from the user who posted it`, async () => {
		const user = await User.create(user1)
		const listing = await Listing.create({ postedBy: user.id, ...listing1 })
		const foundListing = await Listing.findById(listing.id)
		await foundListing.remove()

		const res = await User.findById(user.id)

		expect(Array.isArray(res.listings)).toBeTruthy()
		expect(res.listings).toHaveLength(0)
	})

	it(`Should remove listing's reference from the users who favorited it`, async () => {
		const user = await User.create(user1)
		const listing = await Listing.create({ postedBy: user.id, ...listing1 })

		await userService.favoriteListing(user.id, listing.id)
		listing.favorites = 1
		await listing.save()

		const foundListing = await Listing.findById(listing.id)
		await foundListing.remove()

		const res = await User.findById(user.id)

		expect(res.favorites.get(listing.id)).toBeUndefined()
	})
})
