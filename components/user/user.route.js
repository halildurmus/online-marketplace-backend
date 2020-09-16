const express = require('express')
const router = express.Router()
const { auth, catchAsync } = require('../../middlewares')
const { isValidOperation } = require('./user.util')
const {
	getUserProfile,
	login,
	logout,
	logoutAll,
	createUser,
	updateUser,
} = require('./user.controller')

router.post(
	'/auth/login',
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
	catchAsync(async (req, res) => {
		res.status(201).json(await createUser(req.body))
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
	isValidOperation,
	catchAsync(async (req, res) => {
		res.json(await updateUser(req.params.id, req.body))
	})
)

module.exports = router
