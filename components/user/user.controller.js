const { APIError } = require('../../helpers')
const service = require('./user.service')

module.exports = {
	async createUser(params) {
		const data = await service.createUser(params)

		if (!data) {
			throw new APIError(400, 'You need to provide the params.')
		}

		return data
	},

	async favoriteListing(userId, listingId) {
		const data = await service.favoriteListing(userId, listingId)

		if (!data) {
			throw new APIError(400, 'You can only favorite a listing once.')
		}

		await service.updateFavoritesCounter(listingId, 1)

		return data
	},

	async getUsers(params = {}) {
		const match = {}
		const sort = {}
		const limit = params.limit || 0
		const skip = params.skip || 0

		if (params.email) {
			match.email = params.email.toLowerCase()
		}

		if (params.role) {
			match.role = params.role.toLowerCase()
		}

		if (params.sortBy) {
			sort[params.sortBy] = params.orderBy
				? params.orderBy === 'desc'
					? -1
					: 1
				: 1
		}

		const data = await service.getUsers(match, sort, limit, skip)

		if (!data) {
			throw new APIError(404, 'The users not found.')
		}

		return data
	},

	async getUserFavorites(userId) {
		const data = await service.getUserFavorites(userId)

		if (!data) {
			throw new APIError(404, `The user's favorites not found.`)
		}

		return data
	},

	async getUserListings(userId) {
		const data = await service.getUserListings(userId)

		if (!data) {
			throw new APIError(404, `The user's listings not found.`)
		}

		return data
	},

	async getUserProfile(userId) {
		const data = await service.getUserProfile(userId)

		if (!data) {
			throw new APIError(404, `The user not found.`)
		}

		return data
	},

	async login(params) {
		const data = await service.login(params)

		if (!data) {
			throw new APIError(400, `You need to provide your credentials.`)
		}

		return data
	},

	async logout(user, accessToken) {
		const data = await service.logout(user, accessToken)

		if (!data) {
			throw new APIError(404, 'The user not found.')
		}

		return { message: 'Logout successful.' }
	},

	async logoutAll(user) {
		const data = await service.logoutAll(user)

		if (!data) {
			throw new APIError(404, 'The user not found.')
		}

		return { message: 'Logout all successful.' }
	},

	async removeUser(userId) {
		const data = await service.removeUser(userId)

		if (!data) {
			throw new APIError(404, 'The user not found.')
		}

		return data
	},

	async unfavoriteListing(userId, listingId) {
		const data = await service.unfavoriteListing(userId, listingId)

		if (!data) {
			throw new APIError(
				400,
				'You cannot unfavorite a listing that you have never favorited before.'
			)
		}

		await service.updateFavoritesCounter(listingId, -1)

		return data
	},

	async updateUser(userId, params) {
		const data = await service.updateUser(userId, params)

		if (!data) {
			throw new APIError(404, 'The user not found.')
		}

		return data
	},
}
