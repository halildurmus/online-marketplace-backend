const express = require('express')
const router = express.Router()
const { auth, catchAsync } = require('../../middlewares')
const {
	getUserProfile,
	login,
	logout,
	logoutAll,
	register,
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
		res.status(201).json(await register(req.body))
	})
)

router.get(
	'/users/me',
	auth,
	catchAsync(async (req, res) => {
		res.json(req.user)
	})
)

router.get(
	'/users/:id',
	auth,
	catchAsync(async (req, res) => {
		res.json(await getUserProfile(req.params.id))
	})
)

module.exports = router
