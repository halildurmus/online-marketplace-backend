const mongoose = require('mongoose')
const Schema = mongoose.Schema

const categorySchema = new Schema(
	{
		name: { type: String, required: true, minlength: 3, trim: true },
		parent: { type: String, trim: true, default: '/' },
		category: { type: String, trim: true },
		color: { type: String, trim: true, required: true },
		icon: { type: String, trim: true, required: true },
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
