const mongoose = require('mongoose')
const Schema = mongoose.Schema
const User = require('../user/user.model')

const reviewSchema = new Schema(
	{
		rating: { type: Number, required: true },
		choices: {
			polite: { type: Number, default: 0 },
			showedUpOnTime: { type: Number, default: 0 },
			fairPrices: { type: Number, default: 0 },
			quickResponses: { type: Number, default: 0 },
			trustworthy: { type: Number, default: 0 },
			helpful: { type: Number, default: 0 },
		},
		listingId: { type: String, required: true, ref: 'Listing' },
		message: { type: String, trim: true, maxlength: 150 },
		reviewedUser: { type: String, required: true, ref: 'User' },
		reviewedBy: { type: String, required: true, ref: 'User' },
	},
	{
		timestamps: true,
		toJSON: {
			versionKey: false,
			virtuals: true,
			transform: (doc, ret) => {
				delete ret._id
				delete ret.updatedAt
			},
		},
	}
)

// Save review's reference to the user reviewed.
reviewSchema.pre('save', async function (next) {
	const review = this

	if (review.isNew) {
		await User.findByIdAndUpdate(
			review.reviewedUser,
			{ $push: { reviews: review._id } },
			{ new: true }
		)
	}

	next()
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review
