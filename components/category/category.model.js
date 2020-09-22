const mongoose = require('mongoose')
const Schema = mongoose.Schema

const categorySchema = new Schema(
	{
		name: { type: String, required: true, minLength: 3, trim: true },
		parent: { type: String, trim: true, default: '/' },
		category: { type: String, trim: true },
	},
	{
		timestamps: true,
		toJSON: {
			versionKey: false,
			virtuals: true,
			transform: (doc, ret) => {
				delete ret._id
				delete ret.createdAt
				delete ret.updatedAt
			},
		},
	}
)

categorySchema.pre('save', function () {
	const category = this

	if (category.parent === '/') {
		category.category = `/${category.name.toLowerCase()}`
	} else {
		category.category = `/${category.parent.toLowerCase()}/${category.name.toLowerCase()}`
		category.parent = `/${category.parent.toLowerCase()}`
	}
})

const Category = mongoose.model('Category', categorySchema)

module.exports = Category
