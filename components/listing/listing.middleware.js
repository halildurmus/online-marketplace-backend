const { APIError } = require('../../helpers')
const { catchAsync } = require('../../middlewares')

module.exports.isValidOperation = catchAsync(async (req, res, next) => {
	const updates = Object.keys(req.body)
	const allowedUpdates = [
		'title',
		'description',
		'category',
		'subCategory',
		'price',
		'currencyCode',
		'photos',
		'videos',
		'condition',
	]
	const isValidOperation = updates.every((update) =>
		allowedUpdates.includes(update)
	)

	if (!isValidOperation) {
		throw new APIError(400, `Invalid operation!`)
	}

	next()
})
