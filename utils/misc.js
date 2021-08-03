const { ApiError } = require('../helpers')

module.exports = {
	/**
	 * Searches for a report subject in the given subjects array with the
	 * given subjectId.
	 * @param 	{Array}	subjects	Report subjects array
	 * @param 	{String}	subjectId	Report subject's id
	 * @returns {String} Report subject
	 */
	findReportSubject(subjects, subjectId) {
		for (const node of subjects) {
			if (node.id === subjectId) return node.subject
			if (node.children) {
				const desiredNode = this.findReportSubject(node.children, subjectId)
				if (desiredNode) return desiredNode
			}
		}

		throw new ApiError(400, 'Invalid report subject.')
	},
}
