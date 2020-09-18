const db = require('../../db')
const Listing = db.Listing

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

		if (!listing) {
			return
		}

		return await listing.remove()
	}

	async updateListing(id, fields) {
		return await this.Listing.findByIdAndUpdate(id, fields, {
			new: true,
			runValidators: true,
		})
	}
}

module.exports = ListingService
