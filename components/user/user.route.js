const express = require('express')
const router = express.Router()
const { auth, catchAsync, isRequestBodyBlank } = require('../../middlewares')
const { isValidListingId, isValidOperation } = require('./user.middleware')
const {
	favoriteListing,
	getUserListings,
	getUserProfile,
	login,
	logout,
	logoutAll,
	createUser,
	unfavoriteListing,
	updateUser,
} = require('./user.controller')

router.post(
	'/auth/login',
	isRequestBodyBlank,
	catchAsync(async (req, res) => {
		res.json(await login(req.body))
	})
)

router.post(
	'/auth/logout',
	auth,
	catchAsync(async (req, res) => {
		req.user.tokens = req.user.tokens.filter((token) => {
			return token.token !== req.token
		})
		res.json(await logout(req.user, req.token))
	})
)

router.post(
	'/auth/logout-all',
	auth,
	catchAsync(async (req, res) => {
		req.user.tokens = []
		res.json(await logoutAll(req.user))
	})
)

router.post(
	'/auth/register',
	isRequestBodyBlank,
	catchAsync(async (req, res) => {
		res.status(201).json(await createUser(req.body))
	})
)

router.post(
	'/favorites',
	auth,
	isValidListingId,
	catchAsync(async (req, res) => {
		res.json(await favoriteListing(req.user.id, req.body.id))
	})
)

router.delete(
	'/favorites/:id',
	auth,
	catchAsync(async (req, res) => {
		res.json(await unfavoriteListing(req.user.id, req.params.id))
	})
)

router.get(
	'/users/me',
	auth,
	catchAsync(async (req, res) => {
		res.json(req.user)
	})
)

router.patch(
	'/users/me',
	auth,
	isRequestBodyBlank,
	isValidOperation,
	catchAsync(async (req, res) => {
		res.json(await updateUser(req.user.id, req.body))
	})
)

router.get(
	'/users/:id',
	auth,
	catchAsync(async (req, res) => {
		res.json(await getUserProfile(req.params.id))
	})
)

router.patch(
	'/users/:id',
	auth,
	isRequestBodyBlank,
	isValidOperation,
	catchAsync(async (req, res) => {
		res.json(await updateUser(req.params.id, req.body))
	})
)

router.get(
	'/users/me/listings',
	auth,
	catchAsync(async (req, res) => {
		res.json(await getUserListings(req.user.id))
	})
)

router.get(
	'/users/:id/listings',
	auth,
	catchAsync(async (req, res) => {
		res.json(await getUserListings(req.params.id))
	})
)

module.exports = router
