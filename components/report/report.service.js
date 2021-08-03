const { ApiError } = require('../../helpers')
const Listing = require('../listing/listing.model')
const listingSubjects = require('./listing-subjects')
const userSubjects = require('./user-subjects')
const Report = require('./report.model')
const User = require('../user/user.model')

module.exports = {
	async createReport(userId, params) {
		if (params.reportedListing) {
			if (!(await Listing.findById(params.reportedListing))) {
				throw new ApiError(404, 'Invalid listing id!')
			}
		} else {
			if (!(await User.findById(params.reportedUser))) {
				throw new ApiError(404, 'Invalid user id!')
			}
		}

		const report = new Report(params)
		report.reporter = userId

		return await report.save()
	},

	async getReport(id) {
		const report = await Report.findById(id)

		if (!report) {
			throw new ApiError(404, 'The report not found.')
		}

		return report
	},

	async getReports(match, sort, limit, skip) {
		return Report.find(match)
			.limit(parseInt(limit))
			.skip(parseInt(skip))
			.sort(sort)
	},

	async getListingSubjects() {
		return listingSubjects
	},

	async getUserSubjects() {
		return userSubjects
	},

	async removeReport(id) {
		const report = await Report.findById(id)

		if (!report) {
			throw new ApiError(404, 'The report not found.')
		}

		return await report.remove()
	},

	async updateReport(id, params) {
		const report = await Report.findById(id)

		if (!report) {
			throw new ApiError(404, 'The report not found.')
		}

		const updates = Object.keys(params)
		updates.forEach((update) => (report[update] = params[update]))

		return await report.save()
	},
}
