const db = require('../../db')
const Listing = db.Listing
const Types = db.Types

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
		if (!Types.ObjectId.isValid(id)) {
			return
		}

		const listing = await this.Listing.findById(id)

		if (!listing) {
			return
		}

		return listing.toJSON()
	}

	async getAllListings() {
		const listing = await this.Listing.find({})

		if (!listing) {
			return
		}

		return listing
	}

	async removeListing(id) {
		const listing = await this.Listing.findById(id)

		return await listing.remove()
	}

	async updateListing(id, fields) {
		return await this.Listing.updateListing(id, fields)
	}
}

module.exports = ListingService
