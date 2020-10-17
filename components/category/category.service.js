const Category = require('./category.model')

module.exports = {
	async createCategory(params) {
		if (params.parent) {
			const regExp = new RegExp(`^${params.parent}$`, 'i')
			const isParentCategoryExists = await Category.findOne({
				name: { $regex: regExp },
			})

			if (!isParentCategoryExists) {
				return
			}
		}

		const category = new Category(params)

		return await category.save()
	},

	async getAllCategories() {
		const categories = await Category.find({ parent: '/' })

		if (!categories) {
			return
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
			return
		}

		return categories
	},

	async getCategory(id) {
		const category = await Category.findById(id)

		if (!category) {
			return
		}

		return category
	},

	async getSubcategories(id) {
		const category = await Category.findById(id)

		if (!category) {
			return
		}

		const subcategories = await Category.find({ parent: category.category })

		if (!subcategories) {
			return
		}

		return subcategories
	},

	async removeCategory(id) {
		const category = await Category.findById(id)

		if (!category) {
			return
		}

		return await category.remove()
	},

	async updateCategory(id, params) {
		const category = await Category.findById(id)

		if (!category) {
			return
		}

		const updates = Object.keys(params)
		updates.forEach((update) => (category[update] = params[update]))

		return await category.save()
	},
}
