const db = require('../../db')
const User = db.User

class UserService {
	constructor(db, collectionName) {
		if (!db || !collectionName) {
			this.User = User
		} else {
			this.User = db.collection(collectionName)
		}
	}

	async createUser(fields) {
		const user = new this.User(fields)
		await user.save()
		const token = await user.generateAuthToken()

		return { user: user.toJSON(), token }
	}

	async favoriteListing(userId, listingId) {
		if (await this.User.isFavoritedBefore(userId, listingId)) {
			return
		}

		await this.User.findByIdAndUpdate(
			userId,
			{ $push: { favorites: listingId } },
			{ new: true }
		)

		return await db.Listing.updateFavoritesCount(listingId, 1)
	}

	async getUserFavorites(userId) {
		return (
			await this.User.findById(userId).select('favorites').populate('favorites')
		).favorites
	}

	async getUserListings(userId) {
		return (
			await this.User.findById(userId).select('listings').populate('listings')
		).listings
	}

	async getUserProfile(userId) {
		return await this.User.findById(userId).select(
			'-email -password -tokens -createdAt -updatedAt'
		)
	}

	async login(params) {
		const user = await this.User.findByCredentials(
			params.email,
			params.password
		)
		const token = await user.generateAuthToken()

		return { user: user.toJSON(), token }
	}

	async logout(user, accessToken) {
		user.tokens = user.tokens.filter(({ token }) => token !== accessToken)
		return await user.save()
	}

	async logoutAll(user) {
		user.tokens = []
		return await user.save()
	}

	async unfavoriteListing(userId, listingId) {
		await this.User.findByIdAndUpdate(
			userId,
			{ $pull: { favorites: listingId } },
			{ new: true }
		)

		return await db.Listing.updateFavoritesCount(listingId, -1)
	}

	async updateUser(userId, fields) {
		const user = await this.User.findById(userId)
		const updates = Object.keys(fields)
		updates.forEach((update) => (user[update] = fields[update]))

		return await user.save()
	}
}

module.exports = UserService
