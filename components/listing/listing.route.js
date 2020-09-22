const express = require('express')
const router = express.Router()
const { auth, catchAsync, isRequestBodyBlank } = require('../../middlewares')
const { allowIfLoggedIn, grantAccess } = auth
const { isValidListingId, isValidOperation } = require('./listing.middleware')
const {
	createListing,
	getListing,
	getAllListings,
	removeListing,
	updateListing,
} = require('./listing.controller')

router.get(
	'/listings',
	allowIfLoggedIn,
	catchAsync(async (req, res) => {
		res.json(await getAllListings())
	})
)

router.get(
	'/listings/:id',
	allowIfLoggedIn,
	catchAsync(async (req, res) => {
		res.json(await getListing(req.params.id))
	})
)

router.post(
	'/listings',
	allowIfLoggedIn,
	isRequestBodyBlank,
	catchAsync(async (req, res) => {
		res.status(201).json(await createListing(req.user, req.body))
	})
)

router.patch(
	'/listings/:id',
	allowIfLoggedIn,
	isValidListingId,
	grantAccess('updateOwn', 'listing'),
	isRequestBodyBlank,
	isValidOperation,
	catchAsync(async (req, res) => {
		res.json(await updateListing(req.params.id, req.body))
	})
)

router.delete(
	'/listings/:id',
	allowIfLoggedIn,
	isValidListingId,
	grantAccess('deleteOwn', 'listing'),
	catchAsync(async (req, res) => {
		res.json(await removeListing(req.params.id))
	})
)

module.exports = router
