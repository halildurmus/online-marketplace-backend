const { APIError } = require('../../helpers')
const Category = require('./category.model')

module.exports = {
	async createCategory(params) {
		if (params.parent) {
			const regExp = new RegExp(`^${params.parent}$`, 'i')
			const isParentCategoryExists = await Category.findOne({
				name: { $regex: regExp },
			})

			if (!isParentCategoryExists) {
				throw new APIError(404, `Invalid parent category!`)
			}
		}

		const category = new Category(params)

		return await category.save()
	},

	async getAllCategories() {
		const categories = await Category.find({ parent: '/' })

		if (!categories) {
			throw new APIError(404, `The categories not found.`)
		}

		const allCategories = []

		for (const category of categories) {
			const subcategories = await Category.find({
				parent: category.category,
			})

			allCategories.push({ category, subcategories })
		}

		return allCategories
	},

	async getCategories() {
		const categories = await Category.find({ parent: '/' })

		if (!categories) {
			throw new APIError(404, `The categories not found.`)
		}

		return categories
	},

	async getCategory(id) {
		const category = await Category.findById(id)

		if (!category) {
			throw new APIError(404, `The category not found.`)
		}

		return category
	},

	async getSubcategories(id) {
		const category = await Category.findById(id)

		if (!category) {
			throw new APIError(404, `The category not found.`)
		}

		const subcategories = await Category.find({ parent: category.category })

		if (!subcategories) {
			throw new APIError(404, `The subcategory not found.`)
		}

		return subcategories
	},

	async removeCategory(id) {
		const category = await Category.findById(id)

		if (!category) {
			throw new APIError(404, 'The category not found.')
		}

		return await category.remove()
	},

	async updateCategory(id, params) {
		const category = await Category.findById(id)

		if (!category) {
			throw new APIError(404, 'The category not found.')
		}

		const updates = Object.keys(params)
		updates.forEach((update) => (category[update] = params[update]))

		return await category.save()
	},
}
