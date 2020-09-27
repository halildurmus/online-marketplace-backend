module.exports = {
	getFormattedDate(d) {
		const year = d.getFullYear()
		const month = (d.getMonth() < 10 ? '0' : '') + (d.getMonth() + 1)
		const day = (d.getDate() < 10 ? '0' : '') + d.getDate()
		const hour = (d.getHours() < 10 ? '0' : '') + d.getHours()
		const minute = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes()

		return `${year}-${month}-${day}T${hour}:${minute}`
	},
}
