const { APIError } = require('../../helpers')
const catchAsync = require('../../middlewares/catchAsync')

module.exports.isValidOperation = catchAsync(async (req, res, next) => {
	const updates = Object.keys(req.body)
	const allowedUpdates = [
		'avatar',
		'bio',
		'email',
		'password',
		'firstName',
		'lastName',
	]
	const isValidOperation = updates.every((update) =>
		allowedUpdates.includes(update)
	)

	if (!isValidOperation) {
		throw new APIError(400, `Invalid operation!`)
	}

	next()
})
