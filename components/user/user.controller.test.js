const mongodbHandler = require('../../tests/mongodb-handler')
const controller = require('./user.controller')
const Listing = require('../listing/listing.model')
const User = require('./user.model')
// Dummy objects.
const listing1 = require('../listing/dummies/listing1.json')
const admin = require('./dummies/admin.json')
const user1 = require('./dummies/user1.json')

// Connects to a new in-memory database before running any tests.
beforeAll(async () => await mongodbHandler.connect())

// Clears all test data after every test.
afterEach(async () => await mongodbHandler.clearDatabase())

// Removes and closes the db and server.
afterAll(async () => await mongodbHandler.closeDatabase())

describe('createUser controller', () => {
	it('Should throw an ApiError while creating a user without parameters', async () => {
		await expect(async () => await controller.createUser()).rejects.toThrow(
			'You need to provide the required parameters.'
		)
	})

	it('Should create an user', async () => {
		const user = await controller.createUser(user1)

		expect(user).toMatchObject({})
	})
})

describe('favoriteListing controller', () => {
	it('Should throw an ApiError while trying to favorite a listing without parameters', async () => {
		await expect(
			async () => await controller.favoriteListing()
		).rejects.toThrow('You need to provide userId and listingId.')
	})

	it('Should throw an ApiError while trying to favorite a listing twice', async () => {
		const user = await User.create(user1)
		const listing = await Listing.create({
			postedBy: user.id,
			...listing1,
		})
		await controller.favoriteListing(user.id, listing.id)

		await expect(async () =>
			controller.favoriteListing(user.id, listing.id)
		).rejects.toThrow('You can only favorite a listing once.')
	})

	it('Should favorite the listing', async () => {
		const user = await User.create(user1)
		const listing = await Listing.create({
			postedBy: user.id,
			...listing1,
		})

		const res = await controller.favoriteListing(user.id, listing.id)

		expect(res).toMatchObject({})
	})
})

describe('getUsers controller', () => {
	it(`Should return empty object if no user found`, async () => {
		const users = await controller.getUsers()

		expect(users).toMatchObject({})
	})

	it(`Should return array of users`, async () => {
		await User.create(admin)
		await User.create(user1)
		const users = await controller.getUsers()

		expect(Array.isArray(users)).toBeTruthy()
		expect(users).toHaveLength(2)
	})
})

describe('getUserFavorites controller', () => {
	it('Should throw an ApiError while trying to get user favorites without providing userId', async () => {
		await expect(async () => controller.getUserFavorites()).rejects.toThrow(
			`The user not found.`
		)
	})

	it(`Should return the user favorites`, async () => {
		const user = await User.create(user1)
		const listing = await Listing.create({ postedBy: user.id, ...listing1 })
		await controller.favoriteListing(user.id, listing.id)
		const res = await controller.getUserFavorites(user.id)

		expect(res).toMatchObject({})
	})
})

describe('getUserListings controller', () => {
	it('Should throw an ApiError while trying to get user listings without providing userId', async () => {
		await expect(async () => controller.getUserListings()).rejects.toThrow(
			`The user not found.`
		)
	})

	it(`Should return the user listings`, async () => {
		const user = await User.create(user1)
		await Listing.create({ postedBy: user.id, ...listing1 })
		const res = await controller.getUserListings(user.id)

		expect(res).toMatchObject({})
	})
})

describe('getUserProfile controller', () => {
	it('Should throw an ApiError while trying to get user profile without providing userId', async () => {
		await expect(async () => controller.getUserProfile()).rejects.toThrow(
			'The user not found.'
		)
	})

	it(`Should return the user profile`, async () => {
		const user = await User.create(user1)
		const res = await controller.getUserProfile(user.id)

		expect(res).toMatchObject({})
	})
})

describe('login controller', () => {
	it('Should throw an ApiError while trying to login without providing parameters', async () => {
		await expect(async () => controller.login()).rejects.toThrow(
			'You need to provide your credentials.'
		)
	})

	it(`Should allow the user to login`, async () => {
		await controller.createUser(user1)
		const res = await controller.login({
			email: user1.email,
			password: user1.password,
		})

		expect(res).toMatchObject({})
	})
})

describe('logout controller', () => {
	it('Should throw an ApiError while trying to end current session without providing parameters', async () => {
		await expect(async () => controller.logout()).rejects.toThrow(
			'You need to provide user object and accessToken.'
		)
	})

	it(`Should allow the user to end current session`, async () => {
		const user = await controller.createUser(user1)
		const res = await controller.logout(user.user, user.token)

		expect(res).toMatchObject({})
	})
})

describe('logoutAll controller', () => {
	it('Should throw an ApiError while trying to end all sessions without providing the user object', async () => {
		await expect(async () => controller.logoutAll()).rejects.toThrow(
			'You need to provide user object.'
		)
	})

	it(`Should allow the user to end all sessions`, async () => {
		const user = await User.create(user1)
		const res = await controller.logoutAll(user)

		expect(res).toMatchObject({})
	})
})

describe('removeUser controller', () => {
	it('Should throw an ApiError while trying to remove an user with invalid id', async () => {
		await expect(async () =>
			controller.removeUser('5f785989e8421c13d422f934')
		).rejects.toThrow('The user not found.')
	})

	it('Should remove the user', async () => {
		const user = await controller.createUser(user1)
		const removedUser = await controller.removeUser(user.user.id)

		expect(removedUser).toMatchObject({})
	})
})

describe('unfavoriteListing controller', () => {
	it('Should throw an ApiError while trying to unfavorite a listing without parameters', async () => {
		await expect(
			async () => await controller.unfavoriteListing()
		).rejects.toThrow('You need to provide userId and listingId.')
	})

	it('Should throw an ApiError while trying to unfavorite a listing that never been favorited before', async () => {
		const user = await User.create(user1)
		const listing = await Listing.create({
			postedBy: user.id,
			...listing1,
		})

		await expect(async () =>
			controller.unfavoriteListing(user.id, listing.id)
		).rejects.toThrow(
			'You cannot unfavorite a listing that you have never favorited before.'
		)
	})

	it('Should unfavorite the listing', async () => {
		const user = await User.create(user1)
		const listing = await Listing.create({
			postedBy: user.id,
			...listing1,
		})

		await controller.favoriteListing(user.id, listing.id)
		const res = await controller.unfavoriteListing(user.id, listing.id)

		expect(res).toMatchObject({})
	})
})

describe('updateUser controller', () => {
	it('Should throw an ApiError while trying to update an user with invalid id', async () => {
		await expect(async () =>
			controller.updateUser('5f785989e8421c13d422f934')
		).rejects.toThrow('The user not found.')
	})

	it('Should update the user', async () => {
		const user = await controller.createUser(user1)
		const updatedUser = await controller.updateUser(user.user.id, {
			firstName: 'Test',
		})

		expect(updatedUser).toMatchObject({})
	})
})
