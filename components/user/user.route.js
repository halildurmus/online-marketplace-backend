const express = require('express')
const router = express.Router()
const { auth, catchAsync, isRequestBodyBlank } = require('../../middlewares')
const { allowIfLoggedIn, grantAccess } = auth
const { isValidOperation } = require('./user.middleware')
const {
	blockUser,
	unblockUser,
	createUser,
	favoriteListing,
	getBlockedUsers,
	getMessagedUsers,
	getUsers,
	getUserFavorites,
	getUserListings,
	getUserProfile,
	getUserSoldListings,
	removeUser,
	unfavoriteListing,
	updateUser,
} = require('./user.controller')

router.post(
	'/auth/register',
	isRequestBodyBlank,
	catchAsync(async (req, res) => {
		res.status(201).json(await createUser(req.body))
	})
)

router.post(
	'/block-user',
	allowIfLoggedIn,
	catchAsync(async (req, res) => {
		res.json(await blockUser(req.user.id, req.body.id))
	})
)

router.post(
	'/unblock-user',
	allowIfLoggedIn,
	catchAsync(async (req, res) => {
		res.json(await unblockUser(req.user.id, req.body.id))
	})
)

router.post(
	'/favorites',
	allowIfLoggedIn,
	catchAsync(async (req, res) => {
		res.json(await favoriteListing(req.user.id, req.body.id))
	})
)

router.delete(
	'/favorites/:id',
	allowIfLoggedIn,
	grantAccess('deleteOwn', 'favorites'),
	catchAsync(async (req, res) => {
		res.json(await unfavoriteListing(req.user.id, req.params.id))
	})
)

router.get(
	'/users',
	allowIfLoggedIn,
	grantAccess('readAny', 'profiles'),
	catchAsync(async (req, res) => {
		res.json(await getUsers(req.query))
	})
)

router.get(
	'/users/me',
	allowIfLoggedIn,
	catchAsync(async (req, res) => {
		res.json(req.user)
	})
)

router.post(
	'/users/me/messaged-users',
	allowIfLoggedIn,
	catchAsync(async (req, res) => {
		res.json(await getMessagedUsers(req.body.users))
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
	catchAsync(async (req, res) => {
		res.json(await getUserProfile(req.params.id))
	})
)

router.patch(
	'/users/:id',
	allowIfLoggedIn,
	grantAccess('updateAny', 'profile'),
	isRequestBodyBlank,
	isValidOperation,
	catchAsync(async (req, res) => {
		res.json(await updateUser(req.params.id, req.body))
	})
)

router.delete(
	'/users/:id',
	allowIfLoggedIn,
	grantAccess('deleteAny', 'profile'),
	catchAsync(async (req, res) => {
		res.json(await removeUser(req.params.id))
	})
)

router.get(
	'/users/me/blocked-users',
	allowIfLoggedIn,
	catchAsync(async (req, res) => {
		res.json(await getBlockedUsers(req.user.id))
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
	'/users/me/listings/sold',
	allowIfLoggedIn,
	catchAsync(async (req, res) => {
		res.json(await getUserSoldListings(req.user.id, req.query))
	})
)

router.get(
	'/users/:id/listings',
	allowIfLoggedIn,
	catchAsync(async (req, res) => {
		res.json(await getUserListings(req.params.id))
	})
)

router.get(
	'/users/:id/listings/sold',
	allowIfLoggedIn,
	catchAsync(async (req, res) => {
		res.json(await getUserSoldListings(req.params.id, req.query))
	})
)

module.exports = router
