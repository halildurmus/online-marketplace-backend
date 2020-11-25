const { findSubject } = require('../../utils/misc')
const listingSubjects = require('./listing-subjects')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const userSubjects = require('./user-subjects')

const reportSchema = new Schema(
	{
		reporter: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
		reportedListing: { type: mongoose.Types.ObjectId, ref: 'Listing' },
		reportedUser: { type: mongoose.Types.ObjectId, ref: 'User' },
		subject: { type: Number, required: true },
		message: { type: String },
	},
	{
		timestamps: true,
		toJSON: {
			versionKey: false,
			virtuals: true,
			transform: (doc, ret) => {
				delete ret._id
				delete ret.createdAt
				delete ret.updatedAt
				if (doc.reportedListing) {
					ret.subject = findSubject(listingSubjects, doc.subject)
				} else {
					ret.subject = findSubject(userSubjects, doc.subject)
				}
			},
		},
	}
)

const Report = mongoose.model('Report', reportSchema)

module.exports = Report
