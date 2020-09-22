const { apiPrefix } = require('./config')
const cors = require('cors')
const corsOptions = { optionsSuccessStatus: 200 }
const { error } = require('./middlewares')
const express = require('express')
const app = express()
const categoryRouter = require('./components/category/category.route')
const listingRouter = require('./components/listing/listing.route')
const userRouter = require('./components/user/user.route')

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use(apiPrefix, categoryRouter)
app.use(apiPrefix, listingRouter)
app.use(apiPrefix, userRouter)

// If the error is not an instanceOf APIError, convert it.
// app.use(error.converter)
// Catch 404 and forward to error handler.
app.use(error.notFound)
// Use custom error handler, send stacktrace only during development.
app.use(error.handler)

module.exports = app
