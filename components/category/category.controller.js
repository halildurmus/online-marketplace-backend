const { APIError } = require('../../helpers')
const service = require('./category.service')

module.exports = {
	async createCategory(params) {
		const data = await service.createCategory(params)

		if (!data) {
			throw new APIError(500, `Create category failed.`)
		}

		return data
	},

	async getAllCategories() {
		const data = await service.getAllCategories()

		if (!data) {
			throw new APIError(500, `Get all categories failed.`)
		}

		return data
	},

	async getCategories() {
		const data = await service.getCategories()

		if (!data) {
			throw new APIError(500, `Get categories failed.`)
		}

		return data
	},

	async getCategory(id) {
		const data = await service.getCategory(id)

		if (!data) {
			throw new APIError(404, `The category not found.`)
		}

		return data
	},

	async getSubcategories(id) {
		const data = await service.getSubcategories(id)

		if (!data) {
			throw new APIError(404, `The subcategory not found.`)
		}

		return data
	},

	async removeCategory(id) {
		const data = await service.removeCategory(id)

		if (!data) {
			throw new APIError(404, 'The category not found.')
		}

		return data
	},

	async updateCategory(id, params) {
		const data = await service.updateCategory(id, params)

		if (!data) {
			throw new APIError(404, 'The category not found.')
		}

		return data
	},
}
