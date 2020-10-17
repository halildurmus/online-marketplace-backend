const express = require('express')
const router = express.Router()
const { auth, catchAsync, isRequestBodyBlank } = require('../../middlewares')
const { allowIfLoggedIn, grantAccess } = auth
const {
	createCategory,
	getAllCategories,
	getCategories,
	getCategory,
	getSubcategories,
	removeCategory,
	updateCategory,
} = require('./category.controller')

router.get(
	'/categories/all',
	allowIfLoggedIn,
	catchAsync(async (req, res) => {
		res.json(await getAllCategories())
	})
)

router.get(
	'/categories',
	allowIfLoggedIn,
	catchAsync(async (req, res) => {
		res.json(await getCategories())
	})
)

router.get(
	'/categories/:id',
	allowIfLoggedIn,
	catchAsync(async (req, res) => {
		res.json(await getCategory(req.params.id))
	})
)

router.get(
	'/categories/:id/subcategories',
	allowIfLoggedIn,
	catchAsync(async (req, res) => {
		res.json(await getSubcategories(req.params.id))
	})
)

router.post(
	'/categories',
	allowIfLoggedIn,
	grantAccess('createAny', 'category'),
	isRequestBodyBlank,
	catchAsync(async (req, res) => {
		res.status(201).json(await createCategory(req.body))
	})
)

router.patch(
	'/categories/:id',
	allowIfLoggedIn,
	grantAccess('updateAny', 'category'),
	isRequestBodyBlank,
	catchAsync(async (req, res) => {
		res.json(await updateCategory(req.params.id, req.body))
	})
)

router.delete(
	'/categories/:id',
	allowIfLoggedIn,
	grantAccess('deleteAny', 'category'),
	catchAsync(async (req, res) => {
		res.json(await removeCategory(req.params.id))
	})
)

module.exports = router
