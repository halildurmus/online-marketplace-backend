const { APIError } = require('../../helpers')
const { date } = require('../../utils')
const Listing = require('./listing.model')
const redis = require('../../db/redis')

module.exports = {
	async createListing(userId, params) {
		// TODO: Save only allowed fields in the collection by filtering params.
		const listing = new Listing(params)
		listing.postedBy = userId

		return await listing.save()
	},

	async getListing(id) {
		const listing = await Listing.findById(id)

		if (!listing) {
			throw new APIError(404, 'The listing not found.')
		}

		listing.views += 1

		return listing
	},

	async getListings(match, sort, limit, skip) {
		return Listing.find(match)
			.limit(parseInt(limit))
			.skip(parseInt(skip))
			.sort(sort)
	},

	async removeListing(id) {
		const listing = await Listing.findById(id)

		if (!listing) {
			throw new APIError(404, 'The listing not found.')
		}

		return await listing.remove()
	},

	async updateListing(id, params) {
		const listing = await Listing.findById(id)

		if (!listing) {
			throw new APIError(404, 'The listing not found.')
		}

		const updates = Object.keys(params)
		updates.forEach((update) => (listing[update] = params[update]))

		return await listing.save()
	},

	async updateViewsCounter(id) {
		return redis.hincrby(`views_${date.getFormattedDate(new Date())}`, id, 1)
	},
}
