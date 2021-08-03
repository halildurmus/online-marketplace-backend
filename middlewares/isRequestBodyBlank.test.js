const { ApiError } = require('../helpers')
const { isRequestBodyBlank } = require('./')

it('Should throw an ApiError if the req body is empty', async () => {
	const req = { body: {} }
	const next = jest.fn()
	const error = new ApiError(400, `Request body can't be blank.`)

	await isRequestBodyBlank(req, {}, next)

	expect(next).toBeCalledWith(error)
})

it('Should call the next function if the req body is not empty', async () => {
	const req = { body: { firstName: 'Halil İbrahim', lastName: 'Durmuş' } }
	const next = jest.fn()
	const error = new ApiError(400, `Request body can't be blank.`)

	await isRequestBodyBlank(req, {}, next)

	expect(next).toBeCalled()
	expect(next).not.toBeCalledWith(error)
})
