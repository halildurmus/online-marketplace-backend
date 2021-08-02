const AccessControl = require('accesscontrol')
const ac = new AccessControl()

// Specifies the user permissions.
ac.grant('user')
	.readOwn('favorites')
	.readOwn('listing')
	.readOwn('profile')
	.readAny('category')
	.readAny('favorites')
	.readAny('listing')
	.readAny('profile')
	.updateOwn('listing')
	.updateOwn('profile')
	.deleteOwn('favorites')
	.deleteOwn('listing')

// Specifies the admin permissions.
ac.grant('admin')
	.extend('user')
	.createAny('category')
	.readAny('profiles')
	.readAny('report')
	.updateAny('category')
	.updateAny('listing')
	.updateAny('profile')
	.updateAny('report')
	.deleteAny('category')
	.deleteAny('favorites')
	.deleteAny('listing')
	.deleteAny('profile')
	.deleteAny('report')

module.exports = ac
