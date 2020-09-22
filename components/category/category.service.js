const { mongodb } = require('../../db')
const Category = mongodb.Category

class CategoryService {
	constructor(db, collectionName) {
		if (!db || !collectionName) {
			this.Category = Category
		} else {
			this.Category = db.collection(collectionName)
		}
	}

	async createCategory(params) {
		const category = new this.Category(params)

		return await category.save()
	}

	async getAllCategories() {
		const categories = await this.Category.find({ parent: '/' })

		if (!categories) {
			return
		}

		const allCategories = []

		for (const category of categories) {
			const subcategories = await this.Category.find({
				parent: category.category,
			})

			allCategories.push({ category, subcategories })
		}

		return allCategories
	}

	async getCategories() {
		const categories = await this.Category.find({ parent: '/' })

		if (!categories) {
			return
		}

		return categories
	}

	async getCategory(id) {
		const category = await this.Category.findById(id)

		if (!category) {
			return
		}

		return category
	}

	async getSubcategories(id) {
		const { category } = await this.Category.findById(id)
		const subcategories = await this.Category.find({ parent: category })

		if (!subcategories) {
			return
		}

		return subcategories
	}

	async removeCategory(id) {
		const category = await this.Category.findById(id)

		if (!category) {
			return
		}

		return await category.remove()
	}

	async updateCategory(id, params) {
		const category = await this.Category.findById(id)
		const updates = Object.keys(params)
		updates.forEach((update) => (category[update] = params[update]))

		return await category.save()
	}
}

module.exports = CategoryService
