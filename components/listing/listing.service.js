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

	async createListing(user, fields) {
		const listing = new this.Listing(fields)
		listing.postedBy = user.id
		await listing.save()

		return listing.toJSON()
	}

	async getListing(id) {
		const listing = await this.Listing.findById(id)

		if (!listing) {
			return
		}

		listing.views += 1

		return listing.toJSON()
	}

	async getAllListings() {
		const listing = await this.Listing.find({}).populate('subcategory')

		if (!listing) {
			return
		}

		return listing
	}

	async removeListing(id) {
		const listing = await this.Listing.findById(id)

		if (!listing) {
			return
		}

		return await listing.remove()
	}

	async updateListing(id, fields) {
		return this.Listing.findByIdAndUpdate(id, fields, {
			new: true,
			runValidators: true,
		})
	}

	async updateViewsCounter(id) {
		return redis.hincrby(`views_${date.getDate()}`, id, 1)
	}
}

module.exports = ListingService
