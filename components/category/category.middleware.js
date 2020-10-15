const { APIError } = require('../../helpers')
const { catchAsync } = require('../../middlewares')
const Category = require('./category.model')

module.exports.isParentCategoryExists = catchAsync(async (req, res, next) => {
	if (req.body.parent) {
		const regExp = new RegExp(`^${req.body.parent}$`, 'i')
		const isParentCategoryExists = await Category.findOne({
			name: { $regex: regExp },
		})

		if (!isParentCategoryExists) {
			throw new APIError(404, 'Invalid parent category!')
		}

		next()
	}

	next()
})

module.exports.isValidCategoryId = catchAsync(async (req, res, next) => {
	const isCategoryIdValid = await Category.findById(req.params.id)

	if (!isCategoryIdValid) {
		throw new APIError(404, 'Invalid category id!')
	}

	next()
})
