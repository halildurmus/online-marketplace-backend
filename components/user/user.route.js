const express = require('express')
const router = express.Router()
const { auth, catchAsync, isRequestBodyBlank } = require('../../middlewares')
const { allowIfLoggedIn, grantAccess } = auth
const { isValidListingId } = require('../listing/listing.middleware')
const { isValidOperation, isValidUserId } = require('./user.middleware')
const {
	createUser,
	favoriteListing,
	getUserFavorites,
	getUserListings,
	getUserProfile,
	login,
	logout,
	logoutAll,
	removeUser,
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
	allowIfLoggedIn,
	catchAsync(async (req, res) => {
		req.user.tokens = req.user.tokens.filter((token) => {
			return token.token !== req.token
		})
		res.json(await logout(req.user, req.token))
	})
)

router.post(
	'/auth/logout-all',
	allowIfLoggedIn,
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
	allowIfLoggedIn,
	isValidListingId,
	catchAsync(async (req, res) => {
		res.json(await favoriteListing(req.user.id, req.body.id))
	})
)

router.delete(
	'/favorites/:id',
	allowIfLoggedIn,
	isValidListingId,
	grantAccess('deleteOwn', 'favorites'),
	catchAsync(async (req, res) => {
		res.json(await unfavoriteListing(req.user.id, req.params.id))
	})
)

router.get(
	'/users/me',
	allowIfLoggedIn,
	catchAsync(async (req, res) => {
		res.json(req.user)
	})
)

router.patch(
	'/users/me',
	allowIfLoggedIn,
	grantAccess('updateOwn', 'profile'),
	isRequestBodyBlank,
	isValidOperation,
	catchAsync(async (req, res) => {
		res.json(await updateUser(req.user.id, req.body))
	})
)

router.get(
	'/users/:id',
	allowIfLoggedIn,
	isValidUserId,
	catchAsync(async (req, res) => {
		res.json(await getUserProfile(req.params.id))
	})
)

router.patch(
	'/users/:id',
	allowIfLoggedIn,
	isValidUserId,
	grantAccess('updateOwn', 'profile'),
	isRequestBodyBlank,
	isValidOperation,
	catchAsync(async (req, res) => {
		res.json(await updateUser(req.params.id, req.body))
	})
)

router.delete(
	'/users/:id',
	allowIfLoggedIn,
	isValidUserId,
	grantAccess('deleteAny', 'profile'),
	catchAsync(async (req, res) => {
		res.json(await removeUser(req.params.id))
	})
)

router.get(
	'/users/me/favorites',
	allowIfLoggedIn,
	catchAsync(async (req, res) => {
		res.json(await getUserFavorites(req.user.id))
	})
)

router.get(
	'/users/:id/favorites',
	allowIfLoggedIn,
	isValidUserId,
	catchAsync(async (req, res) => {
		res.json(await getUserFavorites(req.params.id))
	})
)

router.get(
	'/users/me/listings',
	allowIfLoggedIn,
	catchAsync(async (req, res) => {
		res.json(await getUserListings(req.user.id))
	})
)

router.get(
	'/users/:id/listings',
	allowIfLoggedIn,
	isValidUserId,
	catchAsync(async (req, res) => {
		res.json(await getUserListings(req.params.id))
	})
)

module.exports = router
