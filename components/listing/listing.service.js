const { APIError } = require('../../helpers')
const Listing = require('./listing.model')
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://35.198.111.64:9200' })

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

	async getSoldListings(match, limit, skip) {
		return Listing.find(match).limit(parseInt(limit)).skip(parseInt(skip))
	},

	async searchListings(query) {
		const results = await client.search({
			index: 'listings',
			body: {
				suggest: {
					'listing-suggest-fuzzy': {
						prefix: query,
						completion: {
							field: 'title',
						},
					},
				},
			},
		})

		return results.body.suggest['listing-suggest-fuzzy'][0].options
	},

	async searchListingsByKeywords(query) {
		return Listing.find({
			$text: { $search: new RegExp(query, 'i') },
		})
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

		return listing.save()
	},

	async updateViewsCounter(id) {
		return Listing.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
		// return redis.hincrby(`views_${date.getFormattedDate(new Date())}`, id, 1)
	},
}
