const { ApiError } = require('../../helpers')
const Listing = require('../listing/listing.model')
const User = require('./user.model')

module.exports = {
	async blockUser(userId, blockUserId) {
		const user = await User.findById(userId)
		const blockUser = await User.findById(blockUserId)

		if (!user || !blockUser) {
			throw new ApiError(400, 'The user not found.')
		}

		user.blockedUsers.push(blockUserId)

		return await user.save()
	},

	async unblockUser(userId, unblockUserId) {
		const user = await User.findById(userId)
		const unblockUser = await User.findById(unblockUserId)

		if (!user || !unblockUser) {
			throw new ApiError(400, 'The user not found.')
		}

		const index = user.blockedUsers.indexOf(unblockUserId)

		if (index > -1) {
			user.blockedUsers.splice(index, 1)
		}

		return await user.save()
	},

	async createUser(params) {
		// TODO: Save only allowed fields in the collection by filtering params.
		const user = new User(params)
		await user.save()

		return user
	},

	async favoriteListing(userId, listingId) {
		const listing = await Listing.findById(listingId)

		if (!listing) {
			throw new ApiError(400, 'The listing not found.')
		}

		if (await User.isFavoritedBefore(userId, listingId)) {
			throw new ApiError(400, 'You can only favorite a listing once.')
		}

		const user = await User.findById(userId)
		user.favorites.set(listingId, true)
		await Listing.findByIdAndUpdate(listingId, { $inc: { favorites: 1 } })

		return await user.save()
	},

	async getUsers(match = {}, sort = {}, limit = 0, skip = 0) {
		return User.find(match)
			.limit(parseInt(limit))
			.skip(parseInt(skip))
			.sort(sort)
	},

	async getBlockedUsers(userId) {
		const user = await User.findById(userId)

		if (!user) {
			throw new ApiError(404, `The user not found.`)
		}

		return User.find({ _id: { $in: user.blockedUsers } })
	},

	async getMessagedUsers(users) {
		return User.find({ _id: { $in: users } })
	},

	async getUserFavorites(userId) {
		const user = await User.findById(userId)

		if (!user) {
			throw new ApiError(404, `The user not found.`)
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
			throw new ApiError(404, `The user not found.`)
		}

		const listingIds = user.listings

		return Listing.find({ isSold: false, _id: { $in: listingIds } })
	},

	async getUserSoldListings(userId) {
		const user = await User.findById(userId)

		if (!user) {
			throw new ApiError(404, `The user not found.`)
		}

		const listingIds = user.listings

		return Listing.find({ isSold: true, _id: { $in: listingIds } })
	},

	async getUserProfile(id) {
		const user = await User.findById(id)

		if (!user) {
			throw new ApiError(404, `The user not found.`)
		}

		return user
	},

	async removeUser(userId) {
		const user = await User.findById(userId)

		if (!user) {
			throw new ApiError(404, 'The user not found.')
		}

		return await user.remove()
	},

	async unfavoriteListing(userId, listingId) {
		const listing = await Listing.findById(listingId)

		if (!listing) {
			throw new ApiError(404, 'The listing not found.')
		}

		if (!(await User.isFavoritedBefore(userId, listingId))) {
			throw new ApiError(
				400,
				'You cannot unfavorite a listing that you have never favorited before.'
			)
		}

		const key = `favorites.${listingId}`
		const mod = { $unset: {} }
		mod.$unset[key] = 1
		await Listing.findByIdAndUpdate(listingId, { $inc: { favorites: -1 } })

		return User.updateOne({ _id: userId }, mod)
	},

	async updateUser(userId, params) {
		const user = await User.findById(userId)

		if (!user) {
			throw new ApiError(404, 'The user not found.')
		}

		const updates = Object.keys(params)
		updates.forEach((update) => (user[update] = params[update]))

		return await user.save()
	},
}
