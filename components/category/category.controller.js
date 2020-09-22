const { APIError } = require('../../helpers')
const Service = require('./category.service')
const repo = new Service()

module.exports = {
	async createCategory(params) {
		const data = await repo.createCategory(params)

		if (!data) {
			throw new APIError(500, `Create category failed.`)
		}

		return data
	},

	async getAllCategories() {
		const data = await repo.getAllCategories()

		if (!data) {
			throw new APIError(500, `Get all categories failed.`)
		}

		return data
	},

	async getCategories() {
		const data = await repo.getCategories()

		if (!data) {
			throw new APIError(500, `Get categories failed.`)
		}

		return data
	},

	async getCategory(id) {
		const data = await repo.getCategory(id)

		if (!data) {
			throw new APIError(500, `Get category failed.`)
		}

		return data
	},

	async getSubcategories(id) {
		const data = await repo.getSubcategories(id)

		if (!data) {
			throw new APIError(500, `Get subcategories failed.`)
		}

		return data
	},

	async removeCategory(id) {
		const data = await repo.removeCategory(id)

		if (!data) {
			throw new APIError(500, 'Remove category failed.')
		}

		return data
	},

	async updateCategory(id, params) {
		const data = await repo.updateCategory(id, params)

		if (!data) {
			throw new APIError(500, 'Update category failed.')
		}

		return data
	},
}
