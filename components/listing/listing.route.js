const express = require('express')
const router = express.Router()
const { auth, catchAsync, isRequestBodyBlank } = require('../../middlewares')
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
	auth,
	catchAsync(async (req, res) => {
		res.json(await getAllListings())
	})
)

router.get(
	'/listings/:id',
	auth,
	catchAsync(async (req, res) => {
		res.json(await getListing(req.params.id))
	})
)

router.post(
	'/listings',
	auth,
	isRequestBodyBlank,
	catchAsync(async (req, res) => {
		res.status(201).json(await createListing(req.user, req.body))
	})
)

router.patch(
	'/listings/:id',
	auth,
	isRequestBodyBlank,
	isValidOperation,
	catchAsync(async (req, res) => {
		res.json(await updateListing(req.params.id, req.body))
	})
)

router.delete(
	'/listings/:id',
	auth,
	isValidListingId,
	catchAsync(async (req, res) => {
		res.json(await removeListing(req.params.id))
	})
)

module.exports = router
