const { APIError } = require('../../helpers')
const service = require('./listing.service')

module.exports = {
	async createListing(userId, params) {
		const data = await service.createListing(userId, params)

		if (!data) {
			throw new APIError(400, `You need to provide userId and listing params.`)
		}

		return data
	},

	async getListing(id) {
		const data = await service.getListing(id)

		if (!data) {
			throw new APIError(404, 'The listing not found.')
		}

		await service.updateViewsCounter(id)

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

		const data = await service.getListings(match, sort, limit, skip)

		if (!data) {
			throw new APIError(404, `The listings not found.`)
		}

		return data
	},

	async removeListing(id) {
		const data = await service.removeListing(id)

		if (!data) {
			throw new APIError(404, 'The listing not found.')
		}

		return data
	},

	async updateListing(id, params) {
		const data = await service.updateListing(id, params)

		if (!data) {
			throw new APIError(404, 'The listing not found.')
		}

		return data
	},
}
