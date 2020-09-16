const db = require('../../db')
const User = db.User

class UserRepository {
	constructor(db, collectionName) {
		if (!db || !collectionName) {
			this.User = User
		} else {
			this.User = db.collection(collectionName)
		}
	}

	async login(params) {
		const user = await this.User.findByCredentials(
			params.email,
			params.password
		)
		const token = await user.generateAuthToken()

		return { user: user.toJSON(), token }
	}

	async logout(user, accessToken) {
		user.tokens = user.tokens.filter(({ token }) => token !== accessToken)
		return await user.save()
	}

	async logoutAll(user) {
		user.tokens = []
		return await user.save()
	}

	async create(fields) {
		const user = new this.User(fields)
		await user.save()
		const token = await user.generateAuthToken()

		return { user: user.toJSON(), token }
	}
}

module.exports = UserRepository
