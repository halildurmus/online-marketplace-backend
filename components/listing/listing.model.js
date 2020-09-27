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
		category: { type: String, required: true },
		price: { type: Number, required: true, min: 0, trim: true },
		currency: { type: String, required: true, length: 3, trim: true },
		photos: {
			cover: { type: String, required: true },
			photos: { type: [String], required: true },
		},
		videos: { type: [String] },
		condition: {
			type: String,
			enum: ['new', 'like new', 'good', 'fair', 'poor'],
		},
		location: {
			type: {
				type: String,
				enum: ['Point'],
				required: true,
			},
			coordinates: {
				type: [Number],
				required: true,
			},
		},
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

listingSchema.index({ location: '2dsphere' })

// Save listing's reference to the user who posted it.
listingSchema.pre('save', async function (next) {
	const listing = this

	// Runs only when the document was first created. Because of we use .save()
	// method for updating the favorites count, this hook gets triggered every
	// time someone favorites a listing. By doing that check, we avoid the
	// situation that every time someone favorited the listing, it constantly adds
	// listing's reference to the user who posted it.
	if (listing.isNew) {
		const User = mongoose.model('User')
		await User.findByIdAndUpdate(
			listing.postedBy,
			{ $push: { listings: listing._id } },
			{ new: true }
		)
	}

	next()
})

// Remove listing's reference from the user who posted it.
listingSchema.post('remove', async function (doc, next) {
	const listing = doc
	const User = mongoose.model('User')
	await User.findByIdAndUpdate(
		listing.postedBy,
		{ $pull: { listings: listing._id } },
		{ new: true }
	)

	next()
})

// Remove listing's reference from the users who favorited it.
listingSchema.post('remove', async function (doc, next) {
	const listing = doc

	if (listing.favorites > 0) {
		const key = `favorites.${listing._id}`
		const mod = { $unset: {} }
		mod.$unset[key] = 1

		const User = mongoose.model('User')
		await User.updateMany(mod)
	}

	next()
})

const Listing = mongoose.model('Listing', listingSchema)

module.exports = Listing
