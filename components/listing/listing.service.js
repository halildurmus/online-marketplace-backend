const { date } = require('../../utils')
const { mongodb } = require('../../db')
const Listing = mongodb.Listing
const redis = require('../../db/redis')

class ListingService {
	constructor(db, collectionName) {
		if (!db || !collectionName) {
			this.Listing = Listing
		} else {
			this.Listing = db.collection(collectionName)
		}
	}

	async createListing(user, params) {
		const listing = new this.Listing(params)
		listing.postedBy = user.id
		await listing.save()

		return listing
	}

	async getListing(id) {
		const listing = await this.Listing.findById(id)

		if (!listing) {
			return
		}

		listing.views += 1

		return listing
	}

	async getListings(match, sort, limit, skip) {
		const listings = await this.Listing.find(match)
			.limit(parseInt(limit))
			.skip(parseInt(skip))
			.sort(sort)

		if (!listings) {
			return
		}

		return listings
	}

	async removeListing(id) {
		const listing = await this.Listing.findById(id)

		if (!listing) {
			return
		}

		return await listing.remove()
	}

	async updateListing(id, params) {
		const listing = await this.Listing.findById(id)
		const updates = Object.keys(params)
		updates.forEach((update) => (listing[update] = params[update]))

		return await listing.save()
	}

	async updateViewsCounter(id) {
		return redis.hincrby(`views_${date.getDate()}`, id, 1)
	}
}

module.exports = ListingService
