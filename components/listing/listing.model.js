const logger = require('../../utils/logger').loggerServer
const mongoose = require('mongoose')
const mongoosastic = require('mongoosastic')
const Schema = mongoose.Schema
const User = require('../user/user.model')
const { nanoid } = require('nanoid')
const { androidPackageName, firebaseWebApiKey } = require('../../config')
const got = require('got')

const listingSchema = new Schema(
	{
		_id: {
			type: String,
			default: () => nanoid(10),
		},
		shareURL: { type: String, default: '' },
		postedBy: { type: String, ref: 'User', required: true },
		isSold: { type: Boolean, default: false },
		boughtBy: { type: String, ref: 'User' },
		title: {
			type: String,
			required: true,
			minlength: 3,
			maxlength: 70,
			trim: true,
			es_indexed: true,
		},
		description: {
			type: String,
			required: false,
			maxlength: 1000,
			trim: true,
			es_indexed: true,
		},
		category: { type: String, required: true, es_indexed: true },
		price: { type: Number, required: true, min: 0, trim: true },
		currency: {
			type: String,
			required: true,
			minlength: 3,
			maxlength: 3,
			trim: true,
		},
		photos: {
			es_indexed: false,
			cover: { type: String, required: true },
			photos: { type: [String], required: true },
		},
		condition: {
			type: String,
			enum: ['New', 'Like new', 'Good', 'Fair', 'Poor'],
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
			city: String,
			countryCode: String,
			postalCode: String,
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

const generateListingShareUrl = async (listingId) => {
	const response = await got.post(
		`https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${firebaseWebApiKey}`,
		{
			json: {
				dynamicLinkInfo: {
					domainUriPrefix: 'https://codingwithflutter.page.link',
					link: `https://codingwithflutter.page.link/listing?id=${listingId}`,
					androidInfo: {
						androidPackageName,
					},
				},
				suffix: {
					option: 'SHORT',
				},
			},
			responseType: 'json',
		}
	)

	if (response.statusCode === 200) {
		return response.body.shortLink
	}
}

// Generate a share URL for the user's profile and save it.
listingSchema.pre('save', async function (next) {
	const listing = this

	if (listing.isNew) {
		listing.shareURL = await generateListingShareUrl(listing._id)
	}

	next()
})

// Save listing's reference to the user who posted it.
listingSchema.pre('save', async function (next) {
	const listing = this

	// Runs only when the document was first created. Because of we use .save()
	// method for updating the favorites count, this hook gets triggered every
	// time someone favorites a listing. By doing that check, we avoid the
	// situation that every time someone favorited the listing, it constantly adds
	// listing's reference to the user who posted it.
	if (listing.isNew) {
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

		await User.updateMany(mod)
	}

	next()
})

listingSchema.plugin(mongoosastic, {
	host: '35.198.111.64',
	port: 9200,
})

const Listing = mongoose.model('Listing', listingSchema)

Listing.createMapping({}, (err, results) => {
	if (err) return console.error(err)
	logger.info('Listing mapping created.')
})

module.exports = Listing
