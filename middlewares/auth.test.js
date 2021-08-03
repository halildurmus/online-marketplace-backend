const { ApiError } = require('../helpers')
const { allowIfLoggedIn, grantAccess } = require('./auth')
const { createRequest } = require('node-mocks-http')
const User = require('../components/user/user.model')

describe('allowIfLoggedIn middleware', () => {
	it('Should throw an ApiError if the auth header is not found', async () => {
		const req = createRequest({ headers: { Authorization: '' } })
		const next = jest.fn()
		const error = new ApiError(400, 'Authorization token not found.')

		await allowIfLoggedIn(req, {}, next)

		expect(next).toBeCalledWith(error)
	})

	it('Should throw an ApiError if the user is not found', async () => {
		const mockUserFindOne = jest.spyOn(User, 'findOne').mockResolvedValue(false)
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjZmODJmNjIzZjYzZjI4ZThiZjBiNDQiLCJpYXQiOjE2MDEzNjc2NTAsImV4cCI6MTYwMTQ1NDA1MH0.p_vdPKfCgdI6v7Jt_z9BeXCPjX1WMowRsvB3-FoGzUY'
		const req = createRequest({
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		const next = jest.fn()
		const error = new ApiError(401, 'Invalid authorization token.')

		await allowIfLoggedIn(req, {}, next)

		expect(mockUserFindOne).toBeCalledWith({
			_id: '5f6f82f623f63f28e8bf0b44',
			'tokens.token': token,
		})
		expect(next).toBeCalledWith(error)
	})

	it('Should call the next function if the user is found', async () => {
		const mockUserFindOne = jest.spyOn(User, 'findOne').mockResolvedValue(true)
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjZiODU5YzJkYWZiN2E2ZjhiNzQ2NzQiLCJpYXQiOjE2MDEyOTMzMjksImV4cCI6MTYwMTM3OTcyOX0.1AtFtsH7VZAlx7rAomF-YvuZhHNmrvspXGt98bHr5eg'
		const req = createRequest({
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		const next = jest.fn()
		const error = new ApiError(401, 'Invalid authorization token.')

		await allowIfLoggedIn(req, {}, next)

		expect(mockUserFindOne).toBeCalledWith({
			_id: '5f6b859c2dafb7a6f8b74674',
			'tokens.token': token,
		})
		expect(next).toBeCalled()
		expect(next).not.toBeCalledWith(error)
	})
})

describe('grantAccess middleware', () => {
	it(`Should throw an ApiError if the user tries to update someone else's listing`, async () => {
		const req = {
			method: 'PATCH',
			params: { id: '5f6f80cf7b5b6f276c86fca6' },
			user: { listings: ['5f6f80cf7b5b6f276c86fca7'], role: 'user' },
		}
		const next = jest.fn()
		const error = new ApiError(
			403,
			'You do not have permission to perform this action.'
		)
		const isUserAllowed = grantAccess('updateOwn', 'listing')

		await isUserAllowed(req, {}, next)

		expect(next).toBeCalledWith(error)
	})

	it(`Should call the next function if the user tries to update their listing`, async () => {
		const req = {
			method: 'PATCH',
			params: { id: '5f6f80cf7b5b6f276c86fca7' },
			user: { listings: ['5f6f80cf7b5b6f276c86fca7'], role: 'user' },
		}
		const next = jest.fn()
		const error = new ApiError(
			403,
			'You do not have permission to perform this action.'
		)
		const isUserAllowed = grantAccess('updateOwn', 'listing')

		await isUserAllowed(req, {}, next)

		expect(next).toBeCalled()
		expect(next).not.toBeCalledWith(error)
	})

	it(`Should throw an ApiError if the user tries to delete someone else's listing`, async () => {
		const req = {
			method: 'DELETE',
			params: { id: '5f6f80cf7b5b6f276c86fca6' },
			user: { listings: ['5f6f80cf7b5b6f276c86fca7'], role: 'user' },
		}
		const next = jest.fn()
		const error = new ApiError(
			403,
			'You do not have permission to perform this action.'
		)
		const isUserAllowed = grantAccess('deleteOwn', 'listing')

		await isUserAllowed(req, {}, next)

		expect(next).toBeCalledWith(error)
	})

	it(`Should call the next function if the user tries to delete their listing`, async () => {
		const req = {
			method: 'DELETE',
			params: { id: '5f6f80cf7b5b6f276c86fca7' },
			user: { listings: ['5f6f80cf7b5b6f276c86fca7'], role: 'user' },
		}
		const next = jest.fn()
		const error = new ApiError(
			403,
			'You do not have permission to perform this action.'
		)
		const isUserAllowed = grantAccess('deleteOwn', 'listing')

		await isUserAllowed(req, {}, next)

		expect(next).toBeCalled()
		expect(next).not.toBeCalledWith(error)
	})

	it(`Should throw an ApiError if the user tries to update someone else's profile`, async () => {
		const req = {
			method: 'PATCH',
			params: { id: '5f6b859c2dafb7a6f8b74673' },
			user: { id: '5f6b859c2dafb7a6f8b74674', role: 'user' },
		}
		const next = jest.fn()
		const error = new ApiError(
			403,
			'You do not have permission to perform this action.'
		)
		const isUserAllowed = grantAccess('updateAny', 'profile')

		await isUserAllowed(req, {}, next)

		expect(next).toBeCalledWith(error)
	})

	it(`Should call the next function if the user tries to update their profile`, async () => {
		const req = {
			method: 'PATCH',
			params: { id: '5f6b859c2dafb7a6f8b74674' },
			user: { id: '5f6b859c2dafb7a6f8b74674', role: 'user' },
		}
		const next = jest.fn()
		const error = new ApiError(
			403,
			'You do not have permission to perform this action.'
		)
		const isUserAllowed = grantAccess('updateOwn', 'profile')

		await isUserAllowed(req, {}, next)

		expect(next).toBeCalled()
		expect(next).not.toBeCalledWith(error)
	})

	it(`Should throw an ApiError if the user tries to delete someone's profile`, async () => {
		const req = {
			method: 'DELETE',
			params: { id: '5f6b859c2dafb7a6f8b74673' },
			user: { id: ['5f6b859c2dafb7a6f8b74674'], role: 'user' },
		}
		const next = jest.fn()
		const error = new ApiError(
			403,
			'You do not have permission to perform this action.'
		)
		const isUserAllowed = grantAccess('deleteAny', 'profile')

		await isUserAllowed(req, {}, next)

		expect(next).toBeCalledWith(error)
	})

	it(`Should throw an ApiError if the user tries to get all users`, async () => {
		const req = {
			query: {},
			user: { role: 'user' },
		}
		const next = jest.fn()
		const error = new ApiError(
			403,
			'You do not have permission to perform this action.'
		)
		const isUserAllowed = grantAccess('readAny', 'profiles')

		await isUserAllowed(req, {}, next)

		expect(next).toBeCalledWith(error)
	})

	it(`Should call the next function if the admin tries to get all users`, async () => {
		const req = {
			query: {},
			user: { role: 'admin' },
		}
		const next = jest.fn()
		const error = new ApiError(
			403,
			'You do not have permission to perform this action.'
		)
		const isUserAllowed = grantAccess('readAny', 'profiles')

		await isUserAllowed(req, {}, next)

		expect(next).toBeCalled()
		expect(next).not.toBeCalledWith(error)
	})

	it(`Should call the next function if the user tries to unfavorite a listing`, async () => {
		const req = {
			params: { id: '5f6b859c2dafb7a6f8b74671' },
			user: { id: '5f6b859c2dafb7a6f8b74674' },
		}
		const next = jest.fn()
		const error = new ApiError(
			403,
			'You do not have permission to perform this action.'
		)
		const isUserAllowed = grantAccess('deleteOwn', 'favorites')

		await isUserAllowed(req, {}, next)

		expect(next).toBeCalled()
		expect(next).not.toBeCalledWith(error)
	})

	it(`Should throw an ApiError if the user tries to create a category`, async () => {
		const req = {
			body: { name: 'Sports' },
			user: { role: 'user' },
		}
		const next = jest.fn()
		const error = new ApiError(
			403,
			'You do not have permission to perform this action.'
		)
		const isUserAllowed = grantAccess('createAny', 'category')

		await isUserAllowed(req, {}, next)

		expect(next).toBeCalledWith(error)
	})

	it(`Should call the next function if the admin tries to create a category`, async () => {
		const req = {
			body: { name: 'Sports' },
			user: { role: 'admin' },
		}
		const next = jest.fn()
		const error = new ApiError(
			403,
			'You do not have permission to perform this action.'
		)
		const isUserAllowed = grantAccess('createAny', 'category')

		await isUserAllowed(req, {}, next)

		expect(next).toBeCalled()
		expect(next).not.toBeCalledWith(error)
	})

	it(`Should throw an ApiError if the user tries to update a category`, async () => {
		const req = {
			params: { id: '5f6b859c2dafb7a6f8b74670' },
			user: { role: 'user' },
		}
		const next = jest.fn()
		const error = new ApiError(
			403,
			'You do not have permission to perform this action.'
		)
		const isUserAllowed = grantAccess('updateAny', 'category')

		await isUserAllowed(req, {}, next)

		expect(next).toBeCalledWith(error)
	})

	it(`Should call the next function if the admin tries to update a category`, async () => {
		const req = {
			params: { id: '5f6b859c2dafb7a6f8b74670' },
			user: { role: 'admin' },
		}
		const next = jest.fn()
		const error = new ApiError(
			403,
			'You do not have permission to perform this action.'
		)
		const isUserAllowed = grantAccess('updateAny', 'category')

		await isUserAllowed(req, {}, next)

		expect(next).toBeCalled()
		expect(next).not.toBeCalledWith(error)
	})

	it(`Should throw an ApiError if the user tries to delete a category`, async () => {
		const req = {
			params: { id: '5f6b859c2dafb7a6f8b74670' },
			user: { role: 'user' },
		}
		const next = jest.fn()
		const error = new ApiError(
			403,
			'You do not have permission to perform this action.'
		)
		const isUserAllowed = grantAccess('deleteAny', 'category')

		await isUserAllowed(req, {}, next)

		expect(next).toBeCalledWith(error)
	})

	it(`Should call the next function if the admin tries to delete a category`, async () => {
		const req = {
			params: { id: '5f6b859c2dafb7a6f8b74670' },
			user: { role: 'admin' },
		}
		const next = jest.fn()
		const error = new ApiError(
			403,
			'You do not have permission to perform this action.'
		)
		const isUserAllowed = grantAccess('deleteAny', 'category')

		await isUserAllowed(req, {}, next)

		expect(next).toBeCalled()
		expect(next).not.toBeCalledWith(error)
	})
})
