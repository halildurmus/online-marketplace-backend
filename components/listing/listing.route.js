const express = require('express')
const router = express.Router()
const { auth, catchAsync } = require('../../middlewares')
const {
	createListing,
	getListing,
	getAllListings,
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
		const { id } = req.params
		res.json(await getListing(id))
	})
)

router.post(
	'/listings',
	auth,
	catchAsync(async (req, res) => {
		res.status(201).json(await createListing(req.user, req.body))
	})
)

module.exports = router
