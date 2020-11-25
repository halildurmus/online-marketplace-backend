const { isEmail, isMobilePhone, isURL } = require('validator')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema(
	{
		uid: {
			type: String,
			required: true,
			trim: true,
		},
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
			twitter: {
				id: { type: String, index: true, unique: true, sparse: true },
				token: String,
			},
		},
		avatar: {
			type: String,
			trim: true,
			default: 'https://gravatar.com/avatar',
			validate(value) {
				if (!isURL(value, { require_protocol: true })) {
					throw new Error('Invalid avatar url.')
				}
			},
		},
		bio: { type: String, trim: true, maxlength: 150 },
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
		role: {
			type: String,
			enum: ['admin', 'user'],
			default: 'user',
		},
		favorites: { type: Map, of: String, default: {} },
		listings: [{ type: mongoose.Types.ObjectId, ref: 'Listing' }],
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
