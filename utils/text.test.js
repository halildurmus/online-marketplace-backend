const text = require('./text')

it('should parse an authentication token from the provided string', () => {
	const s = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'

	expect(text.parseAuthToken(s)).toEqual('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')
})

it('should throw an APIError if the provided string format is invalid', () => {
	const s1 = 'BearereyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
	const s2 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'

	expect(() => text.parseAuthToken(s1)).toThrow(
		'Invalid authorization header type.'
	)
	expect(() => text.parseAuthToken(s2)).toThrow(
		'Invalid authorization header type.'
	)
})
