const text = require('./text')

it('should parse an authentication token from the provided string', () => {
	const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'

	expect(text.parseAuthToken(token)).toEqual(
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
	)
})

it('should throw an ApiError if the provided string format is invalid', () => {
	const token1 = 'BearereyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
	const token2 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'

	expect(() => text.parseAuthToken(token1)).toThrow(
		'Invalid authorization header type.'
	)
	expect(() => text.parseAuthToken(token2)).toThrow(
		'Invalid authorization header type.'
	)
})
