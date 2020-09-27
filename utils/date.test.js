const date = require('./date')

it('should return the formatted date', () => {
	const d1 = new Date('1 Aug 2020 9:41:00 GMT+3')
	const d2 = new Date('10 Aug 2020 12:41:00 GMT+3')

	expect(date.getFormattedDate(d1)).toEqual('2020-08-01T09:41')
	expect(date.getFormattedDate(d2)).toEqual('2020-08-10T12:41')
})
