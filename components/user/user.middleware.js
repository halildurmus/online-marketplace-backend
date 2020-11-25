const { APIError } = require('../../helpers')
const { catchAsync } = require('../../middlewares')

module.exports.isValidOperation = catchAsync(async (req, res, next) => {
	if (Object.keys(req.body).length === 0 && req.body.constructor === Object) {
		throw new APIError(404, 'You need to provide the fields to be updated!')
	}

	const updates = Object.keys(req.body)
	const allowedUpdates = ['avatar', 'bio', 'email', 'displayName']
	const isValidOperation = updates.every((update) =>
		allowedUpdates.includes(update)
	)

	if (!isValidOperation) {
		throw new APIError(400, `Invalid operation!`)
	}

	next()
})
