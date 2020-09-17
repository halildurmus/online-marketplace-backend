const mongoose = require('mongoose')
const Schema = mongoose.Schema

const listingSchema = new Schema(
	{
		postedBy: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
		title: {
			type: String,
			required: true,
			minLength: 3,
			maxLength: 70,
			trim: true,
		},
		description: {
			type: String,
			required: true,
			minLength: 3,
			maxLength: 1000,
			trim: true,
		},
		category: { type: mongoose.Types.ObjectId, required: false },
		subCategory: { type: mongoose.Types.ObjectId, required: false },
		price: { type: Number, required: true, min: 0, trim: true },
		currencyCode: { type: String, required: true, length: 3, trim: true },
		photos: [{ photo: { type: String, required: false } }],
		videos: [{ video: { type: String } }],
		condition: { type: String },
		favorites: { type: Number, min: 0, default: 0 },
		views: { type: Number, min: 0, default: 0 },
	},
	{
		timestamps: true,
		toJSON: {
			versionKey: false,
			virtuals: true,
			transform: (doc, ret) => {
				delete ret._id
			},
		},
	}
)

listingSchema.statics.updateListing = async (id, fields) => {
	return await Listing.findByIdAndUpdate(id, fields, {
		new: true,
		runValidators: true,
	})
}

// Save listing's reference to the user who posted it.
listingSchema.post('save', async function (doc, next) {
	const User = mongoose.model('User')
	const listing = doc
	await User.findByIdAndUpdate(
		listing.postedBy,
		{ $push: { listings: listing._id } },
		{ new: true }
	)

	next()
})

// Remove listing's reference from the user who posted it.
listingSchema.post('remove', async function (doc, next) {
	const User = mongoose.model('User')
	const listing = doc
	await User.findByIdAndUpdate(
		listing.postedBy,
		{ $pull: { listings: listing._id } },
		{ new: true }
	)

	next()
})

const Listing = mongoose.model('Listing', listingSchema)

module.exports = Listing
