const { date } = require('../../utils')
const { mongodb, redis } = require('../../db')
const Listing = mongodb.Listing

module.exports = {
	async createListing(user, params) {
		// TODO: Save only allowed fields in the collection by filtering params.
		const listing = new Listing(params)
		listing.postedBy = user.id
		await listing.save()

		return listing
	},

	async getListing(id) {
		const listing = await Listing.findById(id)

		if (!listing) {
			return
		}

		listing.views += 1

		return listing
	},

	async getListings(match, sort, limit, skip) {
		const listings = await Listing.find(match)
			.limit(parseInt(limit))
			.skip(parseInt(skip))
			.sort(sort)

		if (!listings) {
			return
		}

		return listings
	},

	async removeListing(id) {
		const listing = await Listing.findById(id)

		if (!listing) {
			return
		}

		return await listing.remove()
	},

	async updateListing(id, params) {
		const listing = await Listing.findById(id)
		const updates = Object.keys(params)
		updates.forEach((update) => (listing[update] = params[update]))

		return await listing.save()
	},

	async updateViewsCounter(id) {
		return redis.hincrby(`views_${date.getFormattedDate(new Date())}`, id, 1)
	},
}
