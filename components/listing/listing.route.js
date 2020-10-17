const express = require('express')
const router = express.Router()
const { auth, catchAsync, isRequestBodyBlank } = require('../../middlewares')
const { allowIfLoggedIn, grantAccess } = auth
const { isValidOperation } = require('./listing.middleware')
const {
	createListing,
	getListing,
	getListings,
	removeListing,
	updateListing,
} = require('./listing.controller')

router.get(
	'/listings',
	allowIfLoggedIn,
	catchAsync(async (req, res) => {
		res.json(await getListings(req.query))
	})
)

router.get(
	'/listings/:id',
	allowIfLoggedIn,
	catchAsync(async (req, res) => {
		res.json(await getListing(req.params.id))
	})
)

// TODO: Restrict what fields can be set when creating a listing.
router.post(
	'/listings',
	allowIfLoggedIn,
	isRequestBodyBlank,
	catchAsync(async (req, res) => {
		res.status(201).json(await createListing(req.user.id, req.body))
	})
)

router.patch(
	'/listings/:id',
	allowIfLoggedIn,
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
	grantAccess('deleteOwn', 'listing'),
	catchAsync(async (req, res) => {
		res.json(await removeListing(req.params.id))
	})
)

module.exports = router
