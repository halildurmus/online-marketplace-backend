const { APIError } = require('../../helpers')
const catchAsync = require('../../middlewares/catchAsync')
const mongoose = require('mongoose')

module.exports.isValidListingId = catchAsync(async (req, res, next) => {
	const Listing = mongoose.model('Listing')
	const isListingIdValid = await Listing.findById(req.body.id)

	if (!isListingIdValid) {
		throw new APIError(404, 'Invalid listing id!')
	}

	next()
})

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
