const { ApiError } = require('../../helpers')
const { catchAsync } = require('../../middlewares')

module.exports.isValidOperation = catchAsync(async (req, res, next) => {
	if (Object.keys(req.body).length === 0 && req.body.constructor === Object) {
		throw new ApiError(404, 'You need to provide the fields to be updated!')
	}

	const updates = Object.keys(req.body)
	const allowedUpdates = [
		'isSold',
		'boughtBy',
		'category',
		'condition',
		'description',
		'location',
		'photos',
		'price',
		'title',
	]
	const isValidOperation = updates.every((update) =>
		allowedUpdates.includes(update)
	)

	if (!isValidOperation) {
		throw new ApiError(400, `Invalid operation!`)
	}

	next()
})
