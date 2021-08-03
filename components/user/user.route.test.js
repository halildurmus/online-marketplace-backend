const mongodbHandler = require('../../tests/mongodb-handler')

// Connects to the in-memory database.
beforeAll(async () => {
	await mongodbHandler.writeMongoUriToEnv()
	await require('../../db').mongodb
})

// Clears all test data after every test.
afterEach(async () => await mongodbHandler.clearDatabase())

const app = require('../../app')
const mongoose = require('mongoose')
const Listing = mongoose.model('Listing')
const User = mongoose.model('User')
const request = require('supertest')
const service = require('./user.service')
// Dummy objects.
const admin = require('../user/dummies/admin.json')
const user1 = require('./dummies/user1.json')
const listing1 = require('../listing/dummies/listing1.json')

async function createListing(userId) {
	return await Listing.create({
		postedBy: userId,
		...listing1,
	})
}

let authToken
async function createUser(userObj) {
	const user = await service.createUser(userObj)
	authToken = user.token

	return user
}

describe('POST /auth/login', () => {
	it('Should respond with 400 if no parameter provided', async () => {
		await request(app).post(`${process.env.API_PREFIX}/auth/login`).expect(400)
	})

	it('Should respond with an object containing logged in user', async () => {
		await createUser(user1)

		const res = await request(app)
			.post(`${process.env.API_PREFIX}/auth/login`)
			.send({ email: user1.email, password: user1.password })
			.expect(200)

		expect(res.body.user.email).toBe(user1.email)
	})
})

describe('POST /auth/logout', () => {
	it('Should respond with 400 if the user is not authenticated', async () => {
		await request(app).post(`${process.env.API_PREFIX}/auth/logout`).expect(400)
	})

	it('Should respond with an object containing the success message', async () => {
		await createUser(user1)

		const res = await request(app)
			.post(`${process.env.API_PREFIX}/auth/logout`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(200)

		expect(res.body).toMatchObject({ message: 'Logout successful.' })
	})
})

describe('POST /auth/logout-all', () => {
	it('Should respond with 400 if the user is not authenticated', async () => {
		await request(app)
			.post(`${process.env.API_PREFIX}/auth/logout-all`)
			.expect(400)
	})

	it('Should respond with an object containing the success message', async () => {
		await createUser(user1)

		const res = await request(app)
			.post(`${process.env.API_PREFIX}/auth/logout-all`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(200)

		expect(res.body).toMatchObject({ message: 'Logout all successful.' })
	})
})

describe('POST /auth/register', () => {
	it('Should respond with 400 if no parameter provided', async () => {
		await request(app)
			.post(`${process.env.API_PREFIX}/auth/register`)
			.expect(400)
	})

	it('Should respond with an object containing created user', async () => {
		const res = await request(app)
			.post(`${process.env.API_PREFIX}/auth/register`)
			.send(user1)
			.expect(201)

		expect(res.body.user.email).toBe(user1.email)
	})
})

describe('POST /favorites', () => {
	it('Should respond with 400 if the user is not authenticated', async () => {
		await request(app).post(`${process.env.API_PREFIX}/favorites`).expect(400)
	})

	it('Should respond with an object containing the user', async () => {
		const user = await createUser(user1)
		const listing = await createListing(user.user.id)

		const res = await request(app)
			.post(`${process.env.API_PREFIX}/favorites`)
			.set('Authorization', `Bearer ${authToken}`)
			.send({ id: listing.id })
			.expect(200)

		expect(res.body.email).toBe(user1.email)
	})
})

describe('DELETE /favorites/:id', () => {
	it('Should respond with 400 if the user is not authenticated', async () => {
		await request(app)
			.delete(`${process.env.API_PREFIX}/favorites/5f785989e8421c13d422f934`)
			.expect(400)
	})

	it('Should respond with an object containing the user', async () => {
		const user = await createUser(user1)
		const listing = await createListing(user.user.id)
		await service.favoriteListing(user.user.id, listing.id)

		await request(app)
			.delete(`${process.env.API_PREFIX}/favorites/${listing.id}`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(200)
	})
})

describe('GET /users', () => {
	it('Should respond with 400 if the user is not authenticated', async () => {
		await request(app).get(`${process.env.API_PREFIX}/users`).expect(400)
	})

	it('Should respond with array of users', async () => {
		await createUser(admin)

		const res = await request(app)
			.get(`${process.env.API_PREFIX}/users`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(200)

		expect(Array.isArray(res.body)).toBeTruthy()
		expect(res.body).toHaveLength(1)
		expect(res.body[0].email).toEqual(admin.email)
	})
})

describe('GET /users/me', () => {
	it('Should respond with 400 if the user is not authenticated', async () => {
		await request(app).get(`${process.env.API_PREFIX}/users/me`).expect(400)
	})

	it('Should respond with object containing the current logged in user', async () => {
		await createUser(user1)

		const res = await request(app)
			.get(`${process.env.API_PREFIX}/users/me`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(200)

		expect(res.body.email).toEqual(user1.email)
	})
})

describe('PATCH /users/me', () => {
	it('Should respond with 400 if the user is not authenticated', async () => {
		await request(app).patch(`${process.env.API_PREFIX}/users/me`).expect(400)
	})

	it(`Should respond with 400 if no parameters provided`, async () => {
		await createUser(user1)

		await request(app)
			.patch(`${process.env.API_PREFIX}/users/me`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(400)
	})

	it(`Should respond with 400 if the update operation is invalid`, async () => {
		await createUser(user1)

		await request(app)
			.patch(`${process.env.API_PREFIX}/users/me`)
			.set('Authorization', `Bearer ${authToken}`)
			.send({ role: 'user' })
			.expect(400)
	})

	it('Should respond with object containing the updated user', async () => {
		await createUser(user1)

		const res = await request(app)
			.patch(`${process.env.API_PREFIX}/users/me`)
			.set('Authorization', `Bearer ${authToken}`)
			.send({ firstName: 'Test' })
			.expect(200)

		expect(res.body.firstName).toEqual('Test')
	})
})

describe('GET /users/:id', () => {
	it('Should respond with 400 if the user is not authenticated', async () => {
		await request(app)
			.get(`${process.env.API_PREFIX}/users/5f785989e8421c13d422f934`)
			.expect(400)
	})

	it('Should respond with object containing the current logged in user', async () => {
		const user = await createUser(user1)

		const res = await request(app)
			.get(`${process.env.API_PREFIX}/users/${user.user.id}`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(200)

		expect(res.body.email).toEqual(user1.email)
	})
})

describe('PATCH /users/:id', () => {
	it('Should respond with 400 if the user is not authenticated', async () => {
		await request(app)
			.patch(`${process.env.API_PREFIX}/users/5f785989e8421c13d422f934`)
			.expect(400)
	})

	it(`Should respond with 403 if the user doesn't have necessary permission`, async () => {
		const user = await createUser(user1)

		await request(app)
			.patch(`${process.env.API_PREFIX}/users/${user.user.id}`)
			.set('Authorization', `Bearer ${authToken}`)
			.send({ firstName: 'Test' })
			.expect(403)
	})

	it(`Should respond with 400 if no parameters provided`, async () => {
		const user = await createUser(admin)

		await request(app)
			.patch(`${process.env.API_PREFIX}/users/${user.user.id}`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(400)
	})

	it(`Should respond with 400 if the update operation is invalid`, async () => {
		const user = await createUser(admin)

		await request(app)
			.patch(`${process.env.API_PREFIX}/users/${user.user.id}`)
			.set('Authorization', `Bearer ${authToken}`)
			.send({ role: 'user' })
			.expect(400)
	})

	it('Should respond with object containing the updated user', async () => {
		const user = await createUser(admin)

		const res = await request(app)
			.patch(`${process.env.API_PREFIX}/users/${user.user.id}`)
			.set('Authorization', `Bearer ${authToken}`)
			.send({ firstName: 'Test' })
			.expect(200)

		expect(res.body.firstName).toEqual('Test')
	})
})

describe('DELETE /users/:id', () => {
	it('Should respond with 400 if the user is not authenticated', async () => {
		await request(app)
			.delete(`${process.env.API_PREFIX}/users/5f785989e8421c13d422f934`)
			.expect(400)
	})

	it(`Should respond with 403 if the user doesn't have necessary permission`, async () => {
		const user = await createUser(user1)

		await request(app)
			.delete(`${process.env.API_PREFIX}/users/${user.user.id}`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(403)
	})

	it('Should respond with object containing the removed user', async () => {
		const user = await createUser(admin)

		const res = await request(app)
			.delete(`${process.env.API_PREFIX}/users/${user.user.id}`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(200)

		expect(res.body.email).toEqual(admin.email)
	})
})

describe('GET /users/me/favorites', () => {
	it('Should respond with 400 if the user is not authenticated', async () => {
		await request(app)
			.get(`${process.env.API_PREFIX}/users/me/favorites`)
			.expect(400)
	})

	it('Should respond with array of favorited listings', async () => {
		const user = await createUser(user1)
		const listing = await createListing(user.user.id)
		await service.favoriteListing(user.user.id, listing.id)

		const res = await request(app)
			.get(`${process.env.API_PREFIX}/users/me/favorites`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(200)

		expect(Array.isArray(res.body)).toBeTruthy()
		expect(res.body).toHaveLength(1)
		expect(res.body[0]).toEqual(expect.objectContaining(listing1))
	})
})

describe('GET /users/:id/favorites', () => {
	it('Should respond with 400 if the user is not authenticated', async () => {
		await request(app)
			.get(`${process.env.API_PREFIX}/users/5f785989e8421c13d422f934/favorites`)
			.expect(400)
	})

	it(`Should respond with array of user's favorited listings`, async () => {
		const user = await createUser(user1)
		const listing = await createListing(user.user.id)
		await service.favoriteListing(user.user.id, listing.id)
		const foundUser = await User.findById(user.user.id)
		foundUser.favorites.set(listing.id, true)
		await foundUser.save()

		const res = await request(app)
			.get(`${process.env.API_PREFIX}/users/${user.user.id}/favorites`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(200)

		expect(Array.isArray(res.body)).toBeTruthy()
		expect(res.body).toHaveLength(1)
		expect(res.body[0]).toEqual(expect.objectContaining(listing1))
	})
})

describe('GET /users/me/listings', () => {
	it('Should respond with 400 if the user is not authenticated', async () => {
		await request(app)
			.get(`${process.env.API_PREFIX}/users/me/listings`)
			.expect(400)
	})

	it(`Should respond with array of listings`, async () => {
		const user = await createUser(user1)
		await createListing(user.user.id)

		const res = await request(app)
			.get(`${process.env.API_PREFIX}/users/me/listings`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(200)

		expect(Array.isArray(res.body)).toBeTruthy()
		expect(res.body).toHaveLength(1)
		expect(res.body[0]).toEqual(expect.objectContaining(listing1))
	})
})

describe('GET /users/:id/listings', () => {
	it('Should respond with 400 if the user is not authenticated', async () => {
		await request(app)
			.get(`${process.env.API_PREFIX}/users/5f785989e8421c13d422f934/listings`)
			.expect(400)
	})

	it(`Should respond with array of user's listings`, async () => {
		const user = await createUser(user1)
		await createListing(user.user.id)

		const res = await request(app)
			.get(`${process.env.API_PREFIX}/users/${user.user.id}/listings`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(200)

		expect(Array.isArray(res.body)).toBeTruthy()
		expect(res.body).toHaveLength(1)
		expect(res.body[0]).toEqual(expect.objectContaining(listing1))
	})
})
