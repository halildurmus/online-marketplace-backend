const { APIError } = require('../../helpers')
const Service = require('./user.service')
const repo = new Service()

module.exports = {
	async createUser(fields) {
		const data = await repo.createUser(fields)

		if (!data) {
			throw new APIError(500, `Registration failed.`)
		}

		return data
	},

	async favoriteListing(userId, listingId) {
		const data = await repo.favoriteListing(userId, listingId)

		if (!data) {
			throw new APIError(400, 'You can only favorite a listing once.')
		}

		await repo.updateFavoritesCounter(listingId, 1)

		return data
	},

	async getUserFavorites(userId) {
		const data = await repo.getUserFavorites(userId)

		if (!data) {
			throw new APIError(500, `Get user favorites failed.`)
		}

		return data
	},

	async getUserListings(userId) {
		const data = await repo.getUserListings(userId)

		if (!data) {
			throw new APIError(500, `Get user listings failed.`)
		}

		return data
	},

	async getUserProfile(userId) {
		const data = await repo.getUserProfile(userId)

		if (!data) {
			throw new APIError(500, `Get user profile failed.`)
		}

		return data
	},

	async login(fields) {
		const data = await repo.login(fields)

		if (!data) {
			throw new APIError(500, `Login failed.`)
		}

		return data
	},

	async logout(user, accessToken) {
		const data = await repo.logout(user, accessToken)

		if (!data) {
			throw new APIError(500, `Logout failed.`)
		}

		return { message: 'Logout successful.' }
	},

	async logoutAll(user) {
		const data = await repo.logoutAll(user)

		if (!data) {
			throw new APIError(500, `Logout all failed.`)
		}

		return { message: 'Logout all successful.' }
	},

	async unfavoriteListing(userId, listingId) {
		const data = await repo.unfavoriteListing(userId, listingId)

		if (!data) {
			throw new APIError(
				400,
				'You cannot unfavorite a listing that you have never favorited before.'
			)
		}

		await repo.updateFavoritesCounter(listingId, -1)

		return data
	},

	async updateUser(userId, fields) {
		const data = await repo.updateUser(userId, fields)

		if (!data) {
			throw new APIError(500, 'Update user failed.')
		}

		return data
	},
}
