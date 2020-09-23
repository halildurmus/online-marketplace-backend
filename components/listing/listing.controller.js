const { APIError } = require('../../helpers')
const Service = require('./listing.service')
const repo = new Service()

module.exports = {
	async createListing(user, params) {
		const data = await repo.createListing(user, params)

		if (!data) {
			throw new APIError(500, `Create listing failed.`)
		}

		return data
	},

	async getListing(id) {
		const data = await repo.getListing(id)

		if (!data) {
			throw new APIError(500, `Get listing failed.`)
		}

		await repo.updateViewsCounter(id)

		return data
	},

	async getListings(params) {
		const match = {}
		const sort = {}
		const limit = params.limit || 0
		const skip = params.skip || 0

		if (params.category) {
			match.category = params.category
		}

		if (params.condition) {
			match.condition = params.condition.toLowerCase()
		}

		if (params.postedWithin) {
			const day =
				params.postedWithin === '24h'
					? 1
					: params.postedWithin === '7d'
					? 7
					: 30
			const d = new Date()
			d.setDate(d.getDate() - day)

			match.createdAt = { $gte: d }
		}

		if (params.priceFrom && params.priceTo) {
			match.price = { $gte: params.priceFrom, $lte: params.priceTo }
		} else if (params.priceFrom && !params.priceTo) {
			match.price = { $gte: params.priceFrom }
		} else if (params.priceTo && !params.priceFrom) {
			match.price = { $lte: params.priceTo }
		}

		if (params.sortBy) {
			sort[params.sortBy] = params.orderBy
				? params.orderBy === 'desc'
					? -1
					: 1
				: 1
		}

		const data = await repo.getListings(match, sort, limit, skip)

		if (!data) {
			throw new APIError(500, `Get all listings failed.`)
		}

		if (data.length === 0) {
			throw new APIError(404, `Listings not found.`)
		}

		return data
	},

	async removeListing(id) {
		const data = await repo.removeListing(id)

		if (!data) {
			throw new APIError(500, `Remove listing failed.`)
		}

		return data
	},

	async updateListing(id, params) {
		const data = await repo.updateListing(id, params)

		if (!data) {
			throw new APIError(500, 'Update listing failed.')
		}

		return data
	},
}
