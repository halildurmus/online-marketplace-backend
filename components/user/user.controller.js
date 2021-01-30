const { APIError } = require('../../helpers')
const service = require('./user.service')

module.exports = {
	async blockUser(userId, blockUserId) {
		if (!userId || !blockUserId) {
			throw new APIError(400, 'You need to provide userId and blockUserId.')
		}

		return await service.blockUser(userId, blockUserId)
	},

	async unblockUser(userId, unblockUserId) {
		if (!userId || !unblockUserId) {
			throw new APIError(400, 'You need to provide userId and unblockUserId.')
		}

		return await service.unblockUser(userId, unblockUserId)
	},

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

	async getBlockedUsers(userId) {
		return await service.getBlockedUsers(userId)
	},

	async getMessagedUsers(users) {
		return await service.getMessagedUsers(users)
	},

	async getUserFavorites(userId) {
		return await service.getUserFavorites(userId)
	},

	async getUserListings(userId) {
		return await service.getUserListings(userId)
	},

	async getUserSoldListings(userId) {
		return await service.getUserSoldListings(userId)
	},

	async getUserProfile(userId) {
		return await service.getUserProfile(userId)
	},

	async removeUser(userId) {
		return await service.removeUser(userId)
	},

	async unfavoriteListing(userId, listingId) {
		if (!userId || !listingId) {
			throw new APIError(400, 'You need to provide userId and listingId.')
		}

		return await service.unfavoriteListing(userId, listingId)
	},

	async updateUser(userId, params) {
		return await service.updateUser(userId, params)
	},
}
