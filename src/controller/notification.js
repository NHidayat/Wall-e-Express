const helper = require('../helper/index');
const { GetNotifByUser, PatchNotifStatus, CountUnreadNotif } = require('../model/m_notification')

module.exports = {
	getUserNotif: async (request, response) => {
		const { id } = request.params
		let { limit } = request.query
		limit = limit == undefined || limit == '' ? 100 : Number(limit)
		try {
			const result = await GetNotifByUser(id, limit)
			const updateNotifStatus = await PatchNotifStatus(id)
			helper.response(response, 200, `Sucess get notification by user ID ${id}`, result)
		} catch (e) {
			helper.response(response, 200, 'Bad Request')
		}
	},
	CountUnreadNotif: async (request, response) => {
		const { id } = request.params
		try {
			const result = await CountUnreadNotif(id)
			helper.response(response, 200, `Sucess get count notification by user ID ${id}`, result)
		} catch (e) {
			helper.response(response, 200, 'Bad Request')
		}
	}
}