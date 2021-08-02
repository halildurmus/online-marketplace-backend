const { APIError } = require('../helpers')
const catchAsync = require('./catchAsync')
const { roles, text } = require('../utils')
const User = require('../components/user/user.model')
const admin = require('firebase-admin')

module.exports.allowIfLoggedIn = catchAsync(async (req, res, next) => {
	let token = req.header('Authorization')
	if (!token) {
		throw new APIError(400, 'Authorization token not found.')
	}

	token = text.parseAuthToken(token)
	const decoded = await admin.auth().verifyIdToken(token)
	if (!decoded) {
		throw new APIError(401, 'Invalid authorization token.')
	}

	const user = await User.findOne({ uid: decoded.user_id })
	if (!user) {
		throw new APIError(401, 'Invalid authorization token.')
	}

	req.user = user
	next()
})

module.exports.grantAccess = (action, resource) => {
	return catchAsync(async (req, res, next) => {
		const error = new APIError(
			403,
			'You do not have permission to perform this action.'
		)

		if (
			req.user.role === 'user' &&
			(req.method === 'DELETE' || req.method === 'PATCH')
		) {
			if (
				resource === 'listing' &&
				!req.user.listings.includes(req.params.id)
			) {
				throw error
			}
		}

		const permission = roles.can(req.user.role)[action](resource)

		if (!permission.granted) {
			throw error
		}

		next()
	})
}
