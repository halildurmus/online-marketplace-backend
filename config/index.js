require('lazy-universal-dotenv').getEnvironment()

module.exports = {
	apiPrefix: process.env.API_PREFIX,
	jwtSecretKey: process.env.JWT_SECRET_KEY,
	mongodbUri: process.env.MONGODB_URI,
	nodeEnv: process.env.NODE_ENV,
}
