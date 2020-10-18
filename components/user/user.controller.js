const { APIError } = require('../../helpers')
const service = require('./user.service')

module.exports = {
	async createUser(params) {
		if (!params) {
			throw new APIError(400, 'You need to provide the required parameters.')
		}

		return await service.createUser(params)
	},

	async favoriteListing(userId, listingId) {
		if (!userId || !listingId) {
			throw new APIError(400, 'You need to provide userId and listingId.')
		}

		await service.updateFavoritesCounter(listingId, 1)

		return await service.favoriteListing(userId, listingId)
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

		return await service.getUsers(match, sort, limit, skip)
	},

	async getUserFavorites(userId) {
		return await service.getUserFavorites(userId)
	},

	async getUserListings(userId) {
		return await service.getUserListings(userId)
	},

	async getUserProfile(userId) {
		return await service.getUserProfile(userId)
	},

	async login(params) {
		if (!params) {
			throw new APIError(400, `You need to provide your credentials.`)
		}

		return await service.login(params)
	},

	async logout(user, accessToken) {
		if (!user || !accessToken) {
			throw new APIError(
				400,
				'You need to provide user object and accessToken.'
			)
		}

		await service.logout(user, accessToken)

		return { message: 'Logout successful.' }
	},

	async logoutAll(user) {
		if (!user) {
			throw new APIError(400, 'You need to provide user object.')
		}

		await service.logoutAll(user)

		return { message: 'Logout all successful.' }
	},

	async removeUser(userId) {
		return await service.removeUser(userId)
	},

	async unfavoriteListing(userId, listingId) {
		if (!userId || !listingId) {
			throw new APIError(400, 'You need to provide userId and listingId.')
		}

		await service.updateFavoritesCounter(listingId, -1)

		return await service.unfavoriteListing(userId, listingId)
	},

	async updateUser(userId, params) {
		return await service.updateUser(userId, params)
	},
}
