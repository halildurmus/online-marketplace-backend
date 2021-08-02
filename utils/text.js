const { APIError } = require('../helpers')

module.exports = {
	/**
	 * Parses the given Bearer Authentication token.
	 * @param 	{String}	token	Bearer Authentication Token e.g. 'Bearer ey95...'
	 * @returns {String} Parsed Authentication Token e.g. 'ey95...'
	 */
	parseAuthToken(token) {
		if (!token.startsWith('Bearer ')) {
			throw new APIError(400, 'Invalid authorization header type.')
		}

		return token.replace('Bearer ', '')
	},
}
