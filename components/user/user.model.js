const { isEmail, isMobilePhone } = require('validator')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { nanoid } = require('nanoid')
const {
	androidPackageName,
	firebaseDynamicLinksUrl,
	firebaseWebApiKey,
} = require('../../config')
const got = require('got')

const userSchema = new Schema(
	{
		_id: { type: String, default: () => nanoid(10) },
		shareURL: { type: String, default: '' },
		reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
		uid: { type: String, required: true, trim: true },
		displayName: {
			type: String,
			required: true,
			minlength: 3,
			maxlength: 25,
			trim: true,
		},
		email: {
			type: String,
			unique: true,
			required: true,
			trim: true,
			lowercase: true,
			validate: { validator: isEmail, msg: 'Invalid email address.' },
		},
		phone: {
			type: String,
			index: true,
			unique: true,
			sparse: true,
			trim: true,
			validate(value) {
				if (!isMobilePhone(value, 'any', { strictMode: true })) {
					throw new Error('Invalid phone number.')
				}
			},
		},
		socials: {
			facebook: {
				id: { type: String, index: true, unique: true, sparse: true },
				token: String,
			},
			google: {
				id: { type: String, index: true, unique: true, sparse: true },
				token: String,
			},
		},
		avatar: { type: String, trim: true, default: '' },
		bio: { type: String, trim: true, maxlength: 150 },
		location: {
			type: { type: String, enum: ['Point'], required: true },
			coordinates: { type: [Number], required: true },
			address: String,
			city: String,
			countryCode: String,
			postalCode: String,
		},
		role: { type: String, enum: ['admin', 'user'], default: 'user' },
		favorites: { type: Map, of: String, default: {} },
		listings: [{ type: String, ref: 'Listing' }],
		blockedUsers: [{ type: String, ref: 'User' }],
	},
	{
		timestamps: true,
		toJSON: {
			versionKey: false,
			virtuals: true,
			transform: (doc, ret) => {
				delete ret._id
				delete ret.createdAt
				delete ret.role
				delete ret.updatedAt
			},
		},
	}
)

userSchema.index({ location: '2dsphere' })

userSchema.statics.isFavoritedBefore = async (userId, listingId) => {
	const user = await User.findById(userId)

	return user.favorites.get(listingId) === 'true'
}

// Generates a Firebase Dynamic Link for the provided userId.
const generateDynamicLinkForUser = async (userId) => {
	const response = await got.post(
		`https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${firebaseWebApiKey}`,
		{
			json: {
				dynamicLinkInfo: {
					domainUriPrefix: firebaseDynamicLinksUrl,
					link: `${firebaseDynamicLinksUrl}/user?id=${userId}`,
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

// Every time a new user created, generate a Firebase Dynamic Link for it.
userSchema.pre('save', async function (next) {
	const user = this

	if (user.isNew) {
		user.shareURL = await generateDynamicLinkForUser(user._id)
	}

	next()
})

// Remove user's listing's and references.
userSchema.post('remove', async function (doc, next) {
	const listingIds = doc.listings

	if (listingIds.length > 0) {
		const Listing = mongoose.model('Listing')
		const User = mongoose.model('User')
		await Listing.deleteMany({ _id: { $in: listingIds } })

		for (const id of listingIds) {
			const key = `favorites.${id}`
			const mod = { $unset: {} }
			mod.$unset[key] = 1
			await User.updateOne(mod)
		}
	}

	next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
