const dbHandler = require('../../tests/db')

// Connects to the in-memory database.
beforeAll(async () => {
	await dbHandler.writeMongoUriToEnv()
	await require('../../db').mongodb
})

// Clears all test data after every test.
afterEach(async () => await dbHandler.clearDatabase())

const app = require('../../app')
const mongoose = require('mongoose')
const Listing = mongoose.model('Listing')
const User = mongoose.model('User')
const redis = require('../../db/redis')
const request = require('supertest')
// Dummy admin object.
const admin = require('../user/dummies/admin.json')
// Dummy listing objects.
const listing1 = require('./dummies/listing1.json')
const listing2 = require('./dummies/listing2.json')

let authToken
beforeEach(async () => {
	// Creates an admin account.
	await User.create(admin)

	// Authenticates with the admin account.
	const user = await request(app)
		.post(`${process.env.API_PREFIX}/auth/login`)
		.send({
			email: 'admin@gmail.com',
			password: 'Test1234',
		})
		.expect(200)

	authToken = user.body.token
})

async function createListings() {
	await Listing.create({
		postedBy: '5f785989e8421c13d422f934',
		...listing1,
	})
	await Listing.create({
		postedBy: '5f785989e8421c13d422f934',
		...listing2,
	})
}

describe('GET /listings', () => {
	it('Should respond with empty array', async () => {
		const res = await request(app)
			.get(`${process.env.API_PREFIX}/listings`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(200)

		expect(Array.isArray(res.body)).toBeTruthy()
		expect(res.body).toHaveLength(0)
	})

	it('Should respond with an array of listings', async () => {
		await createListings()

		const res = await request(app)
			.get(`${process.env.API_PREFIX}/listings`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(200)

		expect(Array.isArray(res.body)).toBeTruthy()
		expect(res.body).toHaveLength(2)
		expect(res.body[0]).toEqual(expect.objectContaining(listing1))
		expect(res.body[1]).toEqual(expect.objectContaining(listing2))
	})
})

describe('GET /listings/:id', () => {
	it('Should respond with 404 if no listing found', async () => {
		await request(app)
			.get(`${process.env.API_PREFIX}/listings/5f785989e8421c13d422f934`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(404)
	})

	it('Should respond with an object containing the requested listing', async () => {
		const mockRedisHincrby = jest
			.spyOn(redis, 'hincrby')
			.mockReturnValueOnce(true)
		const listing = await Listing.create({
			postedBy: '5f785989e8421c13d422f934',
			...listing1,
		})

		const res = await request(app)
			.get(`${process.env.API_PREFIX}/listings/${listing.id}`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(200)

		expect(res.body).toEqual(expect.objectContaining(listing1))

		mockRedisHincrby.mockRestore()
	})
})

describe('POST /listings', () => {
	it('Should respond with 400 if no parameter provided', async () => {
		await request(app)
			.post(`${process.env.API_PREFIX}/listings`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(400)
	})

	it('Should respond with an object containing the created listing', async () => {
		const res = await request(app)
			.post(`${process.env.API_PREFIX}/listings`)
			.set('Authorization', `Bearer ${authToken}`)
			.send(listing1)
			.expect(201)

		expect(res.body).toEqual(expect.objectContaining(listing1))
	})
})

describe('PATCH /listings/:id', () => {
	it('Should respond with 404 if no listing found', async () => {
		await request(app)
			.patch(`${process.env.API_PREFIX}/listings/5f785989e8421c13d422f934`)
			.set('Authorization', `Bearer ${authToken}`)
			.send({ title: 'iPhone 12 Pro Max New' })
			.expect(404)
	})

	it('Should respond with an object containing the updated listing', async () => {
		const listing = await Listing.create({
			postedBy: '5f785989e8421c13d422f934',
			...listing1,
		})

		const res = await request(app)
			.patch(`${process.env.API_PREFIX}/listings/${listing.id}`)
			.set('Authorization', `Bearer ${authToken}`)
			.send({ title: 'iPhone 12 Pro Max New' })
			.expect(200)

		expect(res.body).toMatchObject({ title: 'iPhone 12 Pro Max New' })
	})
})

describe('DELETE /listings/:id', () => {
	it('Should respond with 404 if no listing found', async () => {
		await request(app)
			.delete(`${process.env.API_PREFIX}/listings/5f785989e8421c13d422f934`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(404)
	})

	it('Should respond with an object containing the removed listing', async () => {
		const listing = await Listing.create({
			postedBy: '5f785989e8421c13d422f934',
			...listing1,
		})

		const res = await request(app)
			.delete(`${process.env.API_PREFIX}/listings/${listing.id}`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(200)

		expect(res.body).toEqual(expect.objectContaining(listing1))
	})
})