const service = require('./category.service')

module.exports = {
	async createCategory(params) {
		return await service.createCategory(params)
	},

	async getAllCategories() {
		return await service.getAllCategories()
	},

	async getCategories() {
		return await service.getCategories()
	},

	async getCategory(id) {
		return await service.getCategory(id)
	},

	async getSubcategories(id) {
		return await service.getSubcategories(id)
	},

	async removeCategory(id) {
		return await service.removeCategory(id)
	},

	async updateCategory(id, params) {
		return await service.updateCategory(id, params)
	},
}
