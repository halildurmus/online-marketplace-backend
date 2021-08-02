const { APIError } = require('../../helpers')
const { findReportSubject } = require('../../utils/misc')
const listingSubjects = require('./listing-subjects')
const service = require('./report.service')
const userSubjects = require('./user-subjects')

module.exports = {
	async createReport(userId, params) {
		if (!userId) {
			throw new APIError(400, `You need to provide an userId.`)
		}

		if (!params.reportedListing && !params.reportedUser) {
			throw new APIError(
				400,
				'You need to provide the id of the list or user you are reporting.'
			)
		} else if (params.reportedListing && params.reportedUser) {
			throw new APIError(400, 'You can only report one entity at a time.')
		} else if (params.reportedListing && !params.reportedUser) {
			if (!findReportSubject(listingSubjects, params.subject)) {
				throw new APIError(400, 'Invalid subject!')
			}
		} else if (params.reportedUser && !params.subject) {
			if (!findReportSubject(userSubjects, params.reportedUser)) {
				throw new APIError(400, 'Invalid subject!')
			}
		}
		return await service.createReport(userId, params)
	},

	async getReport(id) {
		return await service.getReport(id)
	},

	async getReports(params, entity) {
		const match = {}
		const sort = {}
		const limit = params.limit || 0
		const skip = params.skip || 0

		if (entity === 'listing') {
			match.reportedListing = { $exists: true }
		} else if (entity === 'user') {
			match.reportedUser = { $exists: true }
		}

		if (params.subject) {
			match.subject = params.subject
		}

		if (params.postedWithin) {
			const day =
				params.postedWithin === '24h'
					? 1
					: params.postedWithin === '7d'
					? 7
					: 30
			const d = new Date()
			d.setDate(d.getDate() - day)

			match.createdAt = { $gte: d }
		}

		if (params.sortBy) {
			sort[params.sortBy] = params.orderBy
				? params.orderBy === 'desc'
					? -1
					: 1
				: 1
		}

		return await service.getReports(match, sort, limit, skip)
	},

	async getListingSubjects() {
		return await service.getListingSubjects()
	},

	async getUserSubjects() {
		return await service.getUserSubjects()
	},

	async removeReport(id) {
		return await service.removeReport(id)
	},

	async updateReport(id, params) {
		return await service.updateReport(id, params)
	},
}
