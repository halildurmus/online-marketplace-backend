const { APIError } = require('../../helpers')
const Service = require('./listing.service')
const repo = new Service()

module.exports = {
	async createListing(user, fields) {
		const data = await repo.createListing(user, fields)

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

		return data
	},

	async getAllListings() {
		const data = await repo.getAllListings()

		if (!data) {
			throw new APIError(500, `Get all listings failed.`)
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

	async updateListing(id, fields) {
		if (Object.keys(fields).length === 0 && fields.constructor === Object) {
			throw new APIError(400, `Fields can't be blank.`)
		}

		const data = await repo.updateListing(id, fields)

		if (!data) {
			throw new APIError(500, 'Update listing failed.')
		}

		return data
	},
}
