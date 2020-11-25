const { APIError } = require('../../helpers')
const { date } = require('../../utils')
const { redisKeyUploadAccessToken } = require('../../config')
const Listing = require('../listing/listing.model')
const User = require('./user.model')
const redis = require('../../db/redis')

module.exports = {
	async createUser(params) {
		// TODO: Save only allowed fields in the collection by filtering params.
		const user = new User(params)
		await user.save()

		return user
	},

	async favoriteListing(userId, listingId) {
		const listing = await Listing.findById(listingId)

		if (!listing) {
			throw new APIError(400, 'The listing not found.')
		}

		if (await User.isFavoritedBefore(userId, listingId)) {
			throw new APIError(400, 'You can only favorite a listing once.')
		}

		const user = await User.findById(userId)
		user.favorites.set(listingId, true)

		return await user.save()
	},

	async getUsers(match = {}, sort = {}, limit = 0, skip = 0) {
		return User.find(match)
			.limit(parseInt(limit))
			.skip(parseInt(skip))
			.sort(sort)
	},

	async getUserFavorites(userId) {
		const user = await User.findById(userId)

		if (!user) {
			throw new APIError(404, `The user not found.`)
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
			throw new APIError(404, `The user not found.`)
		}

		const listingIds = user.listings

		return Listing.find({ _id: { $in: listingIds } })
	},

	async getUserProfile(id) {
		const user = await User.findById(id)

		if (!user) {
			throw new APIError(404, `The user not found.`)
		}

		return user
	},

	async removeUser(userId) {
		const user = await User.findById(userId)

		if (!user) {
			throw new APIError(404, 'The user not found.')
		}

		return await user.remove()
	},

	async unfavoriteListing(userId, listingId) {
		const listing = await Listing.findById(listingId)

		if (!listing) {
			throw new APIError(404, 'The listing not found.')
		}

		if (!(await User.isFavoritedBefore(userId, listingId))) {
			throw new APIError(
				400,
				'You cannot unfavorite a listing that you have never favorited before.'
			)
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
			throw new APIError(404, 'The user not found.')
		}

		const updates = Object.keys(params)
		updates.forEach((update) => (user[update] = params[update]))

		return await user.save()
	},
}
