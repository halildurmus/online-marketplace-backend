const { date } = require('../../utils')
const { mongodb, redis } = require('../../db')
const Listing = mongodb.Listing
const User = mongodb.User

class UserService {
	constructor(db, collectionName) {
		if (!db || !collectionName) {
			this.Listing = Listing
			this.User = User
		} else {
			this.Listing = db.collection('Listing')
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

		const user = await this.User.findById(userId)
		user.favorites.set(listingId, true)
		return await user.save()
	}

	async getUserFavorites(userId) {
		const user = await this.User.findById(userId)
		const favoriteIds = []

		for (const key of user.favorites.keys()) {
			favoriteIds.push(key)
		}

		return await this.Listing.find({ _id: { $in: favoriteIds } })
	}

	async getUserListings(userId) {
		const listingIds = (await this.User.findById(userId)).listings

		return await this.Listing.find({ _id: { $in: listingIds } })
	}

	async getUserProfile(userId) {
		return this.User.findById(userId)
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
		if (!(await this.User.isFavoritedBefore(userId, listingId))) {
			return
		}

		const key = `favorites.${listingId}`
		const mod = { $unset: {} }
		mod.$unset[key] = 1

		return await this.User.updateOne({ _id: userId }, mod)
	}

	async updateFavoritesCounter(id, count) {
		return redis.hincrby(`favorites_${date.getDate()}`, id, count)
	}

	async updateUser(userId, fields) {
		const user = await this.User.findById(userId)
		const updates = Object.keys(fields)
		updates.forEach((update) => (user[update] = fields[update]))

		return await user.save()
	}
}

module.exports = UserService
