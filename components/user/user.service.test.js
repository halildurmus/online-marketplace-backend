const dbHandler = require('../../tests/db')
const Listing = require('../listing/listing.model')
const User = require('./user.model')
const service = require('./user.service')
// Dummy objects.
const listing1 = require('../listing/dummies/listing1.json')
const listing2 = require('../listing/dummies/listing2.json')
const admin = require('./dummies/admin.json')
const user1 = require('./dummies/user1.json')
const user2 = require('./dummies/user2.json')

// Connects to a new in-memory database before running any tests.
beforeAll(async () => await dbHandler.connect())

// Clears all test data after every test.
afterEach(async () => await dbHandler.clearDatabase())

// Removes and closes the db and server.
afterAll(async () => await dbHandler.closeDatabase())

async function createUsers() {
	await service.createUser(admin)
	await service.createUser(user1)
	await service.createUser(user2)
}

describe('createUser service', () => {
	it('Should create an user', async () => {
		const res = await service.createUser(user1)

		expect(res.user.role).toBe('user')
		expect(res.user.email).toEqual(user1.email)
		expect(res.user.firstName).toEqual(user1.firstName)
		expect(res.user.lastName).toEqual(user1.lastName)
		expect(res.user.password).not.toEqual(user1.password)
		expect(res.user.toJSON().location).toEqual(user1.location)
		expect(res.token).toBeTruthy()
		expect(jwt.verify(res.token, jwtSecretKey)._id).toEqual(res.user.id)
	})
})

describe('favoriteListing service', () => {
	// Clears all test data after every test.
	afterEach(async () => await dbHandler.clearDatabase())

	it('Should throw an ApiError if the listing favorited before by the same user', async () => {
		const user = await service.createUser(user1)
		const listing = await Listing.create({
			postedBy: user.user.id,
			...listing1,
		})
		await service.favoriteListing(user.user.id, listing.id)

		await expect(
			async () => await service.favoriteListing(user.user.id, listing.id)
		).rejects.toThrow('You can only favorite a listing once.')
	})

	it('Should favorite the listing', async () => {
		const user = await service.createUser(user1)
		const listing = await Listing.create({
			postedBy: user.user.id,
			...listing1,
		})

		const res = await service.favoriteListing(user.user.id, listing.id)
		expect(res.favorites.get(listing.id)).toBeTruthy()
	})
})

describe('getUsers service', () => {
	// Clears all test data after every test.
	afterEach(async () => await dbHandler.clearDatabase())

	it('Should return empty array if no users found', async () => {
		const users = await service.getUsers({}, {}, 0, 0)

		expect(Array.isArray(users)).toBeTruthy()
		expect(users).toHaveLength(0)
	})

	it('Should return all users', async () => {
		await createUsers()

		const users = await service.getUsers({}, {}, 0, 0)

		expect(Array.isArray(users)).toBeTruthy()
		expect(users).toHaveLength(3)
	})

	it('Should return matching users', async () => {
		await createUsers()

		const users = await service.getUsers({ role: 'admin' }, {}, 0, 0)

		expect(Array.isArray(users)).toBeTruthy()
		expect(users).toHaveLength(1)
		expect(users[0].role).toBe('admin')
	})

	it('Should return users sorted by first name ASC', async () => {
		await createUsers()

		const users = await service.getUsers({}, { firstName: 1 }, 0, 0)

		expect(Array.isArray(users)).toBeTruthy()
		expect(users).toHaveLength(3)
		expect(users[0].firstName).toBe('Elliot')
		expect(users[1].firstName).toBe('Jared')
		expect(users[2].firstName).toBe('Jensen')
	})

	it('Should return users sorted by email DESC', async () => {
		await createUsers()

		const users = await service.getUsers({}, { email: -1 }, 0, 0)

		expect(Array.isArray(users)).toBeTruthy()
		expect(users).toHaveLength(3)
		expect(users[0].email).toBe('user2@gmail.com')
		expect(users[1].email).toBe('user1@gmail.com')
		expect(users[2].email).toBe('admin@gmail.com')
	})

	it('Should return the first user', async () => {
		await createUsers()

		const users = await service.getUsers({}, {}, 1, 0)

		expect(Array.isArray(users)).toBeTruthy()
		expect(users).toHaveLength(1)
		expect(users[0].email).toBe('admin@gmail.com')
	})

	it('Should skip the first user', async () => {
		await createUsers()

		const users = await service.getUsers({}, {}, 0, 1)

		expect(Array.isArray(users)).toBeTruthy()
		expect(users).toHaveLength(2)
		expect(users[0].email).toBe('user1@gmail.com')
		expect(users[1].email).toBe('user2@gmail.com')
	})
})

describe('getUserFavorites service', () => {
	// Clears all test data after every test.
	afterEach(async () => await dbHandler.clearDatabase())

	it('Should return empty array if no favorites found', async () => {
		const user = await service.createUser(user1)
		const users = await service.getUserFavorites(user.user.id)

		expect(Array.isArray(users)).toBeTruthy()
		expect(users).toHaveLength(0)
	})

	it(`Should return the user's favorited listings`, async () => {
		const user = await service.createUser(user1)
		const listing1Obj = await Listing.create({
			postedBy: user.user.id,
			...listing1,
		})
		const listing2Obj = await Listing.create({
			postedBy: user.user.id,
			...listing2,
		})
		await service.favoriteListing(user.user.id, listing1Obj.id)
		await service.favoriteListing(user.user.id, listing2Obj.id)

		const favorites = await service.getUserFavorites(user.user.id)

		expect(Array.isArray(favorites)).toBeTruthy()
		expect(favorites).toHaveLength(2)
		expect(favorites[0].id).toEqual(listing1Obj.id)
		expect(favorites[1].id).toEqual(listing2Obj.id)
	})
})

describe('getUserListings service', () => {
	// Clears all test data after every test.
	afterEach(async () => await dbHandler.clearDatabase())

	it('Should return empty array if no listings found', async () => {
		const user = await service.createUser(user1)
		const listings = await service.getUserListings(user.user.id)

		expect(Array.isArray(listings)).toBeTruthy()
		expect(listings).toHaveLength(0)
	})

	it(`Should return the user's listings`, async () => {
		const user = await service.createUser(user1)
		await Listing.create({
			postedBy: user.user.id,
			...listing1,
		})
		await Listing.create({
			postedBy: user.user.id,
			...listing2,
		})

		const listings = await service.getUserListings(user.user.id)

		expect(Array.isArray(listings)).toBeTruthy()
		expect(listings).toHaveLength(2)
		expect(listings[0].postedBy.toString()).toEqual(user.user.id)
		expect(listings[1].postedBy.toString()).toEqual(user.user.id)
	})
})

describe('getUserProfile service', () => {
	it('Should throw an ApiError if the user not found', async () => {
		await expect(
			async () => await service.getUserProfile('5f785989e8421c13d422f934')
		).rejects.toThrow('The user not found.')
	})

	it('Should return the user profile', async () => {
		const user = await service.createUser(user1)
		const foundUser = await service.getUserProfile(user.user.id)

		expect(foundUser.email).toBe(user1.email)
	})
})

describe('login service', () => {
	it('Should throw an ApiError if the credentials is invalid', async () => {
		await expect(
			async () =>
				await service.login({
					email: user1.email,
					password: user1.password,
				})
		).rejects.toThrow('Invalid credentials.')
	})

	it('Should allow the user to login', async () => {
		await service.createUser(user1)
		const res = await service.login({
			email: user1.email,
			password: user1.password,
		})

		expect(res.user.email).toBe(user1.email)
		expect(jwt.verify(res.token, jwtSecretKey)._id).toEqual(res.user.id)
	})
})

describe('logout service', () => {
	it('Should allow the user to end the current session', async () => {
		await service.createUser(user1)
		const user = await service.login({
			email: user1.email,
			password: user1.password,
		})

		expect(user.user.tokens).toHaveLength(2)

		const res = await service.logout(user.user, user.token)

		expect(res.tokens).toHaveLength(0)
	})
})

describe('logoutAll service', () => {
	it('Should allow the user to end all sessions', async () => {
		await service.createUser(user1)
		const user = await service.login({
			email: user1.email,
			password: user1.password,
		})

		expect(user.user.tokens).toHaveLength(2)

		const res = await service.logoutAll(user.user)

		expect(res.tokens).toHaveLength(0)
	})
})

describe('removeUser service', () => {
	it('Should throw an ApiError if the user not found', async () => {
		await expect(
			async () => await service.removeUser('5f785989e8421c13d422f934')
		).rejects.toThrow('The user not found.')
	})

	it('Should remove the user', async () => {
		const user = await service.createUser(user1)
		const res = await service.removeUser(user.user.id)

		expect(res.email).toBe(user1.email)
	})
})

describe('unfavoriteListing service', () => {
	// Clears all test data after every test.
	afterEach(async () => await dbHandler.clearDatabase())

	it('Should throw an ApiError if the listing is not favorited before by the same user', async () => {
		const user = await service.createUser(user1)
		const listing = await Listing.create({
			postedBy: user.user.id,
			...listing1,
		})

		await expect(
			async () => await service.unfavoriteListing(user.user.id, listing.id)
		).rejects.toThrow(
			'You cannot unfavorite a listing that you have never favorited before.'
		)
	})

	it('Should unfavorite the listing', async () => {
		const user = await service.createUser(user1)
		const listing1Obj = await Listing.create({
			postedBy: user.user.id,
			...listing1,
		})
		const listing2Obj = await Listing.create({
			postedBy: user.user.id,
			...listing2,
		})
		await service.favoriteListing(user.user.id, listing1Obj.id)
		const res1 = await service.favoriteListing(user.user.id, listing2Obj.id)

		expect(res1.favorites.get(listing1Obj.id)).toBeTruthy()
		expect(res1.favorites.get(listing2Obj.id)).toBeTruthy()

		await service.unfavoriteListing(user.user.id, listing1Obj.id)
		const res2 = await User.findById(user.user.id)

		expect(res2.favorites.get(listing1Obj.id)).toBeUndefined()
		expect(res2.favorites.get(listing2Obj.id)).toBeTruthy()
	})
})

describe('updateUser service', () => {
	it('Should throw an ApiError if no user found', async () => {
		await expect(
			async () => await service.updateUser('5f785989e8421c13d422f934')
		).rejects.toThrow('The user not found.')
	})

	it('Should update the user', async () => {
		const user = await service.createUser(user1)

		const updatedUser = await service.updateUser(user.user.id, {
			firstName: 'Test',
		})

		expect(updatedUser.firstName).toBe('Test')
	})
})
