const Review = require('./review.model')
const User = require('../user/user.model')

module.exports = {
	async getListingReviews(listingId) {
		return Review.find({ listingId: listingId }).populate([
			{ path: 'reviewedBy' },
			{ path: 'reviewedUser' },
		])
	},

	async getUserReviews(userId) {
		const reviews = await User.findById(userId, 'reviews').populate({
			path: 'reviews',
			populate: [{ path: 'reviewedBy' }, { path: 'reviewedUser' }],
		})
		return reviews.reviews
	},

	async publishReview(userId, params) {
		const review = new Review(params)
		review.reviewedBy = userId
		await review.save()

		return Review.findById(review.id).populate([
			{ path: 'reviewedBy' },
			{ path: 'reviewedUser' },
		])
	},
}
