const connection = require("../config/mysql")

module.exports = {
	postNotification: (data) => {
		return new Promise((resolve, reject) => {
            connection.query("INSERT INTO notification SET ?", data, (error, result) => {
                !error ? resolve(result) : reject(new Error(error))
            });
        });
	},
    GetNotifByUser: (id, limit) => {
        return new Promise((resolve, reject) => {
            connection.query("SELECT * FROM notification WHERE user_id = ? ORDER BY notif_created_at DESC LIMIT ?", [id, limit], (error, result) => {
                !error ? resolve(result) : reject(new Error(error))
            });
        });
    },
    PatchNotifStatus: (id) => {
        return new Promise((resolve, reject) => {
            connection.query("UPDATE notification SET notif_status = 1 WHERE user_id = ?", id, (error, result) => {
                !error ? resolve(result) : reject(new Error(error))
            });
        });
    },
    CountUnreadNotif: (id) => {
        return new Promise((resolve, reject) => {
            connection.query("SELECT COUNT(*) AS total FROM notification WHERE notif_status = 2 AND user_id = ?", id, (error, result) => {
                !error ? resolve(result) : reject(new Error(error))
            });
        });
    }
}