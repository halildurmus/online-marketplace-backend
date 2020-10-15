const fs = require('fs')
const envfile = require('envfile')
const { MongoMemoryServer } = require('mongodb-memory-server')
const mongod = new MongoMemoryServer({ instance: { port: 27018 } })
const mongoose = require('mongoose')
const path = require('path')

mongoose.set('bufferCommands', false)

// Connects to the in-memory database.
module.exports.connect = async () => {
	const uri = await mongod.getUri()

	const mongooseOpts = {
		bufferMaxEntries: 0,
		family: 4,
		serverSelectionTimeoutMS: 5000,
		useCreateIndex: true,
		useFindAndModify: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}

	await mongoose.connect(uri, mongooseOpts)

	require('../components/user/user.model')
}

// Removes all the data for all db collections.
module.exports.clearDatabase = async () => {
	const collections = mongoose.connection.collections

	for (const key in collections) {
		const collection = collections[key]
		await collection.deleteMany()
	}
}

// Drops database, closes the connection and stop mongod.
module.exports.closeDatabase = async () => {
	await mongoose.connection.dropDatabase()
	await mongoose.connection.close()
	await mongod.stop()
}

// Writes the mongod URI to .env.test file.
module.exports.writeMongoUriToEnv = async () => {
	const mongodUri = await mongod.getUri()
	const filePath = path.join(__dirname, '..', '.env.test')
	const parsedFile = envfile.parse('../.env.test')
	parsedFile.MONGODB_URI = mongodUri
	fs.writeFileSync(filePath, envfile.stringify(parsedFile))
}
