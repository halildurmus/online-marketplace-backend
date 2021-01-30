const express = require('express')
const router = express.Router()
const { auth, catchAsync, isRequestBodyBlank } = require('../../middlewares')
const { allowIfLoggedIn, grantAccess } = auth
const {
	getListingReviews,
	getUserReviews,
	publishReview,
} = require('./review.controller')

router.get(
	'/reviews/:id',
	allowIfLoggedIn,
	catchAsync(async (req, res) => {
		res.json(await getUserReviews(req.params.id))
	})
)

router.get(
	'/listing-reviews/:id',
	allowIfLoggedIn,
	catchAsync(async (req, res) => {
		res.json(await getListingReviews(req.params.id))
	})
)

router.post(
	'/reviews',
	allowIfLoggedIn,
	isRequestBodyBlank,
	catchAsync(async (req, res) => {
		res.status(201).json(await publishReview(req.user.id, req.body))
	})
)

module.exports = router
