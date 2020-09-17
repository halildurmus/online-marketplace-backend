const { APIError } = require('../../helpers')
const bcrypt = require('bcrypt')
const { capitalizeEachWord } = require('../../utils/text')
const jwt = require('jsonwebtoken')
const { jwtSecretKey } = require('../../config')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { isEmail, isURL, matches } = require('validator')

const userSchema = new Schema(
	{
		firstName: { type: String, required: true, minLength: 3, trim: true },
		lastName: { type: String, required: true, minLength: 3, trim: true },
		email: {
			type: String,
			unique: true,
			required: true,
			trim: true,
			lowercase: true,
			validate: { validator: isEmail, msg: 'Invalid email address.' },
		},
		password: {
			type: String,
			required: true,
			trim: true,
			validate(value) {
				const pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
				if (!matches(value, pattern)) {
					throw new Error('')
				}

				if (value.toLowerCase().includes('password')) {
					// TODO: Validate using a blacklisted passwords list.
					throw new Error('Password cannot contain "password".')
				}
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
		bio: { type: String, trim: true, maxLength: 150, default: '' },
		favorites: [{ type: mongoose.Types.ObjectId, ref: 'Listing' }],
		listings: [{ type: mongoose.Types.ObjectId, ref: 'Listing' }],
		tokens: [{ token: { type: String, required: true } }],
	},
	{
		timestamps: true,
		toJSON: {
			versionKey: false,
			virtuals: true,
			transform: (doc, ret) => {
				delete ret._id
				delete ret.createdAt
				delete ret.hash
				delete ret.password
				delete ret.tokens
				delete ret.updatedAt
			},
		},
	}
)

userSchema.methods.generateAuthToken = async function () {
	const user = this
	const token = jwt.sign({ _id: user._id.toString() }, jwtSecretKey, {
		expiresIn: '24h',
	})
	user.tokens = user.tokens.concat({ token })
	await user.save()

	return token
}

userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email })

	if (!user) {
		throw new APIError(401, 'Invalid credentials.')
	}

	const isMatch = await bcrypt.compare(password, user.password)

	if (!isMatch) {
		throw new APIError(401, 'Invalid credentials.')
	}

	return user
}

userSchema.statics.getListingsByUser = async (id) => {
	return (await User.findById(id).select('listings').populate('listings'))
		.listings
}

userSchema.statics.getUserProfile = async (id) => {
	return await User.findById(id).select(
		'-email -password -tokens -createdAt -updatedAt'
	)
}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
	const user = this

	if (user.isModified('firstName') && user.isModified('lastName')) {
		user.firstName = capitalizeEachWord(user.firstName)
		user.lastName = capitalizeEachWord(user.lastName)
	}

	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8)
	}

	next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
