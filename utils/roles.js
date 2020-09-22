const AccessControl = require('accesscontrol')
const ac = new AccessControl()

ac.grant('user')
	.readOwn('favorites')
	.readOwn('listing')
	.readOwn('profile')
	.readAny('favorites')
	.readAny('listing')
	.readAny('profile')
	.updateOwn('listing')
	.updateOwn('profile')
	.deleteOwn('favorites')
	.deleteOwn('listing')

ac.grant('admin')
	.extend('user')
	.updateAny('listing')
	.updateAny('profile')
	.deleteAny('favorites')
	.deleteAny('listing')
	.deleteAny('profile')

module.exports = ac
