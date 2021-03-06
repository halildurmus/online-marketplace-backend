const { ApiError } = require('../helpers')
const catchAsync = require('./catchAsync')

module.exports = catchAsync(async (req, res, next) => {
	if (Object.keys(req.body).length === 0 && req.body.constructor === Object) {
		throw new ApiError(400, `Request body can't be blank.`)
	}

	next()
})
