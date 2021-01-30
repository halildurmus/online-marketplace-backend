require('lazy-universal-dotenv').getEnvironment()

module.exports = {
	androidPackageName: process.env.ANDROID_PACKAGE_NAME,
	apiPrefix: process.env.API_PREFIX,
	firebaseDbUrl: process.env.FIREBASE_DB_URL,
	firebaseWebApiKey: process.env.FIREBASE_WEB_API_KEY,
	jwtSecretKey: process.env.JWT_SECRET_KEY,
	mongodbUri: process.env.MONGODB_URI,
	nodeEnv: process.env.NODE_ENV,
	redisUri: process.env.REDIS_URL,
}
