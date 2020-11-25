const { apiPrefix, firebaseDbUrl } = require('./config')
const cors = require('cors')
const corsOptions = { optionsSuccessStatus: 200 }
const { error } = require('./middlewares')
const express = require('express')
const app = express()
const categoryRouter = require('./components/category/category.route')
const listingRouter = require('./components/listing/listing.route')
const reportRouter = require('./components/report/report.route')
const userRouter = require('./components/user/user.route')
const admin = require('firebase-admin')
const serviceAccount = require('./auth-9c17c-firebase-adminsdk-lwygd-3e0c1a8b43.json')

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: firebaseDbUrl,
})

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Register routes.
app.use(apiPrefix, categoryRouter)
app.use(apiPrefix, listingRouter)
app.use(apiPrefix, reportRouter)
app.use(apiPrefix, userRouter)

app.get('/health', async (req, res) => {
	const healthCheck = {
		message: 'OK',
		uptime: process.uptime(),
		timestamp: Date.now(),
	}

	try {
		res.send(healthCheck)
	} catch (e) {
		healthCheck.message = e
		res.status(503).send()
	}
})

// If the error is not an instanceOf APIError, convert it.
// app.use(error.converter)
// Catch 404 and forward to error handler.
app.use(error.notFound)
// Use custom error handler, send stacktrace only during development.
app.use(error.handler)

module.exports = app
