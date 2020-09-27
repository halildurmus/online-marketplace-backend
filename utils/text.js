const { APIError } = require('../helpers')

module.exports = {
	parseAuthToken(str) {
		if (!str.startsWith('Bearer ')) {
			throw new APIError(400, 'Invalid authorization header type.')
		}

		return str.replace('Bearer ', '')
	},
}
