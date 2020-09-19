const { APIError } = require('../../helpers')
const { catchAsync } = require('../../middlewares')
const mongoose = require('mongoose')

module.exports.isValidOperation = catchAsync(async (req, res, next) => {
	const updates = Object.keys(req.body)
	const allowedUpdates = [
		'avatar',
		'bio',
		'email',
		'firstName',
		'lastName',
		'password',
	]
	const isValidOperation = updates.every((update) =>
		allowedUpdates.includes(update)
	)

	if (!isValidOperation) {
		throw new APIError(400, `Invalid operation!`)
	}

	next()
})

module.exports.isValidUserId = catchAsync(async (req, res, next) => {
	const User = mongoose.model('User')
	const isUserIdValid = await User.findById(req.body.id || req.params.id)

	if (!isUserIdValid) {
		throw new APIError(404, 'Invalid user id!')
	}

	next()
})
