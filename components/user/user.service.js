const { date } = require('../../utils')
const Listing = require('../listing/listing.model')
const User = require('./user.model')
const redis = require('../../db/redis')

module.exports = {
	async createUser(params) {
		if (!params) {
			return
		}

		// TODO: Save only allowed fields in the collection by filtering params.
		const user = new User(params)
		await user.save()
		const token = await user.generateAuthToken()

		return { user, token }
	},

	async favoriteListing(userId, listingId) {
		if (!userId || !listingId) {
			return
		}

		if (await User.isFavoritedBefore(userId, listingId)) {
			return
		}

		const user = await User.findById(userId)
		user.favorites.set(listingId, true)

		return await user.save()
	},

	async getUsers(match = {}, sort = {}, limit = 0, skip = 0) {
		const users = await User.find(match)
			.limit(parseInt(limit))
			.skip(parseInt(skip))
			.sort(sort)

		if (!users) {
			return
		}

		return users
	},

	async getUserFavorites(userId) {
		const user = await User.findById(userId)

		if (!user) {
			return
		}

		const favoriteIds = []

		for (const key of user.favorites.keys()) {
			favoriteIds.push(key)
		}

		return Listing.find({ _id: { $in: favoriteIds } })
	},

	async getUserListings(userId) {
		const user = await User.findById(userId)

		if (!user) {
			return
		}

		const listingIds = user.listings

		return Listing.find({ _id: { $in: listingIds } })
	},

	async getUserProfile(userId) {
		const user = await User.findById(userId)

		if (!user) {
			return
		}

		return user
	},

	async login(params) {
		if (!params) {
			return
		}

		const user = await User.findByCredentials(params.email, params.password)
		const token = await user.generateAuthToken()

		return { user, token }
	},

	async logout(user, accessToken) {
		if (!user || !accessToken) {
			return
		}

		user.tokens = user.tokens.filter(({ token }) => token !== accessToken)

		return await user.save()
	},

	async logoutAll(user) {
		if (!user) {
			return
		}

		user.tokens = []

		return await user.save()
	},

	async removeUser(userId) {
		const user = await User.findById(userId)

		if (!user) {
			return
		}

		return await user.remove()
	},

	async unfavoriteListing(userId, listingId) {
		if (!userId || !listingId) {
			return
		}

		if (!(await User.isFavoritedBefore(userId, listingId))) {
			return
		}

		const key = `favorites.${listingId}`
		const mod = { $unset: {} }
		mod.$unset[key] = 1

		return User.updateOne({ _id: userId }, mod)
	},

	async updateFavoritesCounter(id, count) {
		return redis.hincrby(
			`favorites_${date.getFormattedDate(new Date())}`,
			id,
			count
		)
	},

	async updateUser(userId, params) {
		const user = await User.findById(userId)

		if (!user) {
			return
		}

		const updates = Object.keys(params)
		updates.forEach((update) => (user[update] = params[update]))

		return await user.save()
	},
}
