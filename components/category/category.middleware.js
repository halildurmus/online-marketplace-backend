const { APIError } = require('../../helpers')
const { catchAsync } = require('../../middlewares')
const mongoose = require('mongoose')

module.exports.isValidCategoryId = catchAsync(async (req, res, next) => {
	const Category = mongoose.model('Category')
	const isCategoryIdValid = await Category.findById(req.params.id)

	if (!isCategoryIdValid) {
		throw new APIError(404, 'Invalid category id!')
	}

	next()
})
