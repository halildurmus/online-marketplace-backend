const { APIError } = require('../../helpers')
const { catchAsync } = require('../../middlewares')
const mongoose = require('mongoose')

module.exports.isValidListingId = catchAsync(async (req, res, next) => {
	const Listing = mongoose.model('Listing')
	const isListingIdValid = await Listing.findById(req.body.id || req.params.id)

	if (!isListingIdValid) {
		throw new APIError(404, 'Invalid listing id!')
	}

	next()
})

module.exports.isValidOperation = catchAsync(async (req, res, next) => {
	const updates = Object.keys(req.body)
	const allowedUpdates = [
		'category',
		'condition',
		'currency',
		'description',
		'photos',
		'price',
		'title',
		'videos',
	]
	const isValidOperation = updates.every((update) =>
		allowedUpdates.includes(update)
	)

	if (!isValidOperation) {
		throw new APIError(400, `Invalid operation!`)
	}

	next()
})
