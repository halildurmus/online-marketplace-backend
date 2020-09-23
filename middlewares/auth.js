const { APIError } = require('../helpers')
const catchAsync = require('./catchAsync')
const jwt = require('jsonwebtoken')
const { jwtSecretKey } = require('../config')
const { roles, text } = require('../utils')
const User = require('../components/user/user.model')

module.exports.allowIfLoggedIn = catchAsync(async (req, res, next) => {
	let token = req.header('Authorization')

	if (!token) {
		throw new APIError(400, 'Authorization token not found.')
	}

	token = text.parseAuthToken(token)

	if (!token) {
		throw new APIError(400, 'Invalid authorization header type.')
	}

	const decoded = jwt.verify(token, jwtSecretKey)
	const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

	if (!user) {
		throw new APIError(401, 'Invalid authorization token.')
	}

	req.token = token
	req.user = user
	next()
})

module.exports.grantAccess = function (action, resource) {
	return catchAsync(async (req, res, next) => {
		if (req.user.role === 'user' && req.method === ('DELETE' || 'PATCH')) {
			if (
				resource === 'listing' &&
				!req.user.listings.includes(req.params.id)
			) {
				throw new APIError(
					403,
					'You do not have permission to perform this action.'
				)
			} else if (resource === 'profile' && req.user.id !== req.params.id) {
				throw new APIError(
					403,
					'You do not have permission to perform this action.'
				)
			}
		}

		const permission = roles.can(req.user.role)[action](resource)

		if (!permission.granted) {
			throw new APIError(
				403,
				'You do not have permission to perform this action.'
			)
		}

		next()
	})
}

module.exports.restrictTo = function (...roles) {
	return catchAsync(async (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			throw new APIError(
				403,
				'You do not have permission to perform this action.'
			)
		}

		next()
	})
}
