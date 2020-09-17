const express = require('express')
const router = express.Router()
const { auth, catchAsync } = require('../../middlewares')
const { isValidOperation } = require('./listing.util')
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
	catchAsync(async (req, res) => {
		res.status(201).json(await createListing(req.user, req.body))
	})
)

router.patch(
	'/listings/:id',
	auth,
	isValidOperation,
	catchAsync(async (req, res) => {
		res.json(await updateListing(req.params.id, req.body))
	})
)

router.delete(
	'/listings/:id',
	auth,
	catchAsync(async (req, res) => {
		res.json(await removeListing(req.params.id))
	})
)

module.exports = router
