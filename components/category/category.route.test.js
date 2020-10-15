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
const Category = mongoose.model('Category')
const User = mongoose.model('User')
const request = require('supertest')

let authToken
beforeEach(async () => {
	// Creates an admin account.
	await User.create({
		email: 'haroldfinch@gmail.com',
		firstName: 'Harold',
		lastName: 'Finch',
		password: 'Test1234',
		role: 'admin',
		location: {
			type: 'Point',
			coordinates: [13.405, 52.52],
		},
	})

	// Authenticates with the admin account.
	const user = await request(app)
		.post(`${process.env.API_PREFIX}/auth/login`)
		.send({
			email: 'haroldfinch@gmail.com',
			password: 'Test1234',
		})
		.expect(200)

	authToken = user.body.token
})

describe('GET /categories/all', () => {
	it('Should respond with empty array', async () => {
		const res = await request(app)
			.get(`${process.env.API_PREFIX}/categories/all`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(200)

		expect(Array.isArray(res.body)).toBeTruthy()
		expect(res.body).toHaveLength(0)
	})

	it('Should respond with an array of categories', async () => {
		await Category.create({ name: 'Electronics' })
		await Category.create({ name: 'Gaming' })
		await Category.create({
			name: 'Mouse',
			parent: 'Gaming',
		})

		const res = await request(app)
			.get(`${process.env.API_PREFIX}/categories/all`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(200)

		expect(Array.isArray(res.body)).toBeTruthy()
		expect(res.body).toMatchObject([
			{ category: { name: 'Electronics' } },
			{ category: { name: 'Gaming' } },
		])
		expect(res.body).toHaveLength(2)
	})
})

describe('GET /categories', () => {
	it('Should respond with empty array', async () => {
		const res = await request(app)
			.get(`${process.env.API_PREFIX}/categories`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(200)

		expect(Array.isArray(res.body)).toBeTruthy()
		expect(res.body).toHaveLength(0)
	})

	it('Should respond with an array of parent categories', async () => {
		await Category.create({ name: 'Electronics' })
		await Category.create({ name: 'Gaming' })
		await Category.create({
			name: 'Mouse',
			parent: 'Gaming',
		})

		const res = await request(app)
			.get(`${process.env.API_PREFIX}/categories`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(200)

		expect(Array.isArray(res.body)).toBeTruthy()
		expect(res.body).toMatchObject([
			{ name: 'Electronics' },
			{ name: 'Gaming' },
		])
		expect(res.body).toHaveLength(2)
	})
})

describe('GET /categories/:id', () => {
	it('Should respond with 404 if no category found', async () => {
		await request(app)
			.get(`${process.env.API_PREFIX}/categories/5f785989e8421c13d422f934`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(404)
	})

	it('Should respond with an object containing the requested category', async () => {
		const category = await Category.create({ name: 'Electronics' })

		const res = await request(app)
			.get(`${process.env.API_PREFIX}/categories/${category.id}`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(200)

		expect(res.body).toMatchObject({ name: 'Electronics' })
	})
})

describe('GET /categories/:id/subcategories', () => {
	it('Should respond with 404 if no category found', async () => {
		await request(app)
			.get(
				`${process.env.API_PREFIX}/categories/5f785989e8421c13d422f934/subcategories`
			)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(404)
	})

	it('Should respond with an object containing subcategories of the requested category', async () => {
		const category = await Category.create({ name: 'Gaming' })
		await Category.create({
			name: 'Keyboard',
			parent: 'Gaming',
		})
		await Category.create({
			name: 'Mouse',
			parent: 'Gaming',
		})

		const res = await request(app)
			.get(`${process.env.API_PREFIX}/categories/${category.id}/subcategories`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(200)

		expect(res.body).toMatchObject([{ name: 'Keyboard' }, { name: 'Mouse' }])
		expect(res.body).toHaveLength(2)
	})
})

describe('POST /categories', () => {
	it('Should respond with 400 if no name provided', async () => {
		await request(app)
			.post(`${process.env.API_PREFIX}/categories`)
			.set('Authorization', `Bearer ${authToken}`)
			.send({ name: '' })
			.expect(400)
	})

	it('Should respond with an object containing the created category', async () => {
		const res = await request(app)
			.post(`${process.env.API_PREFIX}/categories`)
			.set('Authorization', `Bearer ${authToken}`)
			.send({ name: 'Gaming' })
			.expect(201)

		expect(res.body).toMatchObject({ name: 'Gaming' })
	})
})

describe('PATCH /categories/:id', () => {
	it('Should respond with 404 if no category found', async () => {
		await request(app)
			.patch(`${process.env.API_PREFIX}/categories/5f785989e8421c13d422f934`)
			.set('Authorization', `Bearer ${authToken}`)
			.send({ name: 'Electronics1' })
			.expect(404)
	})

	it('Should respond with an object containing the updated category', async () => {
		const category = await Category.create({ name: 'Electronics' })

		const res = await request(app)
			.patch(`${process.env.API_PREFIX}/categories/${category.id}`)
			.set('Authorization', `Bearer ${authToken}`)
			.send({ name: 'Electronics1' })
			.expect(200)

		expect(res.body).toMatchObject({ name: 'Electronics1' })
	})
})

describe('DELETE /categories/:id', () => {
	it('Should respond with 404 if no category found', async () => {
		await request(app)
			.delete(`${process.env.API_PREFIX}/categories/5f785989e8421c13d422f934`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(404)
	})

	it('Should respond with an object containing the removed category', async () => {
		const category = await Category.create({ name: 'Electronics' })

		const res = await request(app)
			.delete(`${process.env.API_PREFIX}/categories/${category.id}`)
			.set('Authorization', `Bearer ${authToken}`)
			.expect(200)

		expect(res.body).toMatchObject({ name: 'Electronics' })
	})
})
