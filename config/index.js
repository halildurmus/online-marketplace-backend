require('lazy-universal-dotenv').getEnvironment()

module.exports = {
	androidPackageName: process.env.ANDROID_PACKAGE_NAME,
	apiPrefix: process.env.API_PREFIX,
	firebaseDbUrl: process.env.FIREBASE_DB_URL,
	firebaseDynamicLinksUrl: process.env.FIREBASE_DYNAMIC_LINKS_URL,
	firebaseWebApiKey: process.env.FIREBASE_WEB_API_KEY,
	mongodbUri: process.env.MONGODB_URI,
	nodeEnv: process.env.NODE_ENV,
}
