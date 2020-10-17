const dbHandler = require('../../tests/db')
const controller = require('./user.controller')
const Listing = require('../listing/listing.model')
const redis = require('../../db/redis')
const User = require('./user.model')
// Dummy listing objects.
const listing1 = require('../listing/dummies/listing1.json')
// Dummy user objects.
const admin = require('./dummies/admin.json')
const user1 = require('./dummies/user1.json')

// Connects to a new in-memory database before running any tests.
beforeAll(async () => await dbHandler.connect())

// Clears all test data after every test.
afterEach(async () => await dbHandler.clearDatabase())

// Removes and closes the db and server.
afterAll(async () => await dbHandler.closeDatabase())

describe('createUser controller', () => {
	it('Should create an user', async () => {
		const user = await controller.createUser(user1)

		expect(user).toMatchObject({})
	})
})

describe('favoriteListing controller', () => {
	it('Should throw an APIError while trying to favorite a listing twice', async () => {
		const mockRedisHincrby = jest
			.spyOn(redis, 'hincrby')
			.mockReturnValueOnce(true)
			.mockReturnValueOnce(true)
		const user = await User.create(user1)
		const listing = await Listing.create({
			postedBy: user.id,
			...listing1,
		})
		await controller.favoriteListing(user.id, listing.id)

		await expect(async () =>
			controller.favoriteListing(user.id, listing.id)
		).rejects.toThrow('You can only favorite a listing once.')
		mockRedisHincrby.mockRestore()
	})

	it('Should favorite the listing', async () => {
		const mockRedisHincrby = jest
			.spyOn(redis, 'hincrby')
			.mockReturnValueOnce(true)
		const user = await User.create(user1)
		const listing = await Listing.create({
			postedBy: user.id,
			...listing1,
		})

		const res = await controller.favoriteListing(user.id, listing.id)

		expect(res).toMatchObject({})
		mockRedisHincrby.mockRestore()
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
	it('Should throw an APIError while trying to get user favorites without providing userId', async () => {
		await expect(async () => controller.getUserFavorites()).rejects.toThrow(
			`The user's favorites not found.`
		)
	})

	it(`Should return the user favorites`, async () => {
		const mockRedisHincrby = jest
			.spyOn(redis, 'hincrby')
			.mockReturnValueOnce(true)
		const user = await User.create(user1)
		const listing = await Listing.create({ postedBy: user.id, ...listing1 })
		await controller.favoriteListing(user.id, listing.id)
		const res = await controller.getUserFavorites(user.id)

		expect(res).toMatchObject({})
		mockRedisHincrby.mockRestore()
	})
})

describe('getUserListings controller', () => {
	it('Should throw an APIError while trying to get user listings without providing userId', async () => {
		await expect(async () => controller.getUserListings()).rejects.toThrow(
			`The user's listings not found.`
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
	it('Should throw an APIError while trying to get user profile without providing userId', async () => {
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
	it('Should throw an APIError while trying to login without providing parameters', async () => {
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
	it('Should throw an APIError while trying to end current session without providing parameters', async () => {
		await expect(async () => controller.logout()).rejects.toThrow(
			'The user not found.'
		)
	})

	it(`Should allow the user to end current session`, async () => {
		const user = await controller.createUser(user1)
		const res = await controller.logout(user.user, user.token)

		expect(res).toMatchObject({})
	})
})

describe('logoutAll controller', () => {
	it('Should throw an APIError while trying to end all sessions without providing the user object', async () => {
		await expect(async () => controller.logoutAll()).rejects.toThrow(
			'The user not found.'
		)
	})

	it(`Should allow the user to end all sessions`, async () => {
		const user = await User.create(user1)
		const res = await controller.logoutAll(user)

		expect(res).toMatchObject({})
	})
})

describe('removeUser controller', () => {
	it('Should throw an APIError while trying to remove an user with invalid id', async () => {
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
	it('Should throw an APIError while trying to unfavorite a listing that never been favorited before', async () => {
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
		const mockRedisHincrby = jest
			.spyOn(redis, 'hincrby')
			.mockReturnValueOnce(true)
			.mockReturnValueOnce(true)
		const user = await User.create(user1)
		const listing = await Listing.create({
			postedBy: user.id,
			...listing1,
		})

		await controller.favoriteListing(user.id, listing.id)
		const res = await controller.unfavoriteListing(user.id, listing.id)

		expect(res).toMatchObject({})
		mockRedisHincrby.mockRestore()
	})
})

describe('updateUser controller', () => {
	it('Should throw an APIError while trying to update an user with invalid id', async () => {
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
