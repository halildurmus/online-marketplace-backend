const db = require('../../db')
const User = db.User

class UserService {
	constructor(db, collectionName) {
		if (!db || !collectionName) {
			this.User = User
		} else {
			this.User = db.collection(collectionName)
		}
	}

	async getUserProfile(userId) {
		return await this.User.getUserProfile(userId)
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

	async createUser(fields) {
		const user = new this.User(fields)
		await user.save()
		const token = await user.generateAuthToken()

		return { user: user.toJSON(), token }
	}

	async updateUser(userId, params) {
		const user = await this.User.findById(userId)
		const updates = Object.keys(params)
		updates.forEach((update) => (user[update] = params[update]))

		return await user.save()
	}
}

module.exports = UserService
