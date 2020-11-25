const express = require('express')
const router = express.Router()
const { auth, catchAsync, isRequestBodyBlank } = require('../../middlewares')
const { allowIfLoggedIn, grantAccess } = auth
const {
	createReport,
	getReport,
	getReports,
	getListingSubjects,
	getUserSubjects,
	removeReport,
	updateReport,
} = require('./report.controller')

router.get(
	'/reports/listing-subjects',
	allowIfLoggedIn,
	catchAsync(async (req, res) => {
		res.json(await getListingSubjects())
	})
)

router.get(
	'/reports/user-subjects',
	allowIfLoggedIn,
	catchAsync(async (req, res) => {
		res.json(await getUserSubjects())
	})
)

router.get(
	'/reports/listings',
	allowIfLoggedIn,
	grantAccess('readAny', 'report'),
	catchAsync(async (req, res) => {
		res.json(await getReports(req.query, 'listing'))
	})
)

router.get(
	'/reports/users',
	allowIfLoggedIn,
	grantAccess('readAny', 'report'),
	catchAsync(async (req, res) => {
		res.json(await getReports(req.query, 'user'))
	})
)

router.get(
	'/reports/:id',
	allowIfLoggedIn,
	grantAccess('readAny', 'report'),
	catchAsync(async (req, res) => {
		res.json(await getReport(req.params.id))
	})
)

router.post(
	'/reports',
	allowIfLoggedIn,
	isRequestBodyBlank,
	catchAsync(async (req, res) => {
		res.status(201).json(await createReport(req.user.id, req.body))
	})
)

router.patch(
	'/reports/:id',
	allowIfLoggedIn,
	grantAccess('updateAny', 'report'),
	isRequestBodyBlank,
	catchAsync(async (req, res) => {
		res.json(await updateReport(req.params.id, req.body))
	})
)

router.delete(
	'/reports/:id',
	allowIfLoggedIn,
	grantAccess('deleteAny', 'report'),
	catchAsync(async (req, res) => {
		res.json(await removeReport(req.params.id))
	})
)

module.exports = router
