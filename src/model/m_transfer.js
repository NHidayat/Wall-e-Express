const connection = require("../config/mysql");

module.exports = {
	postTransfer: (setData) => {
		return new Promise((resolve, reject) => {
            connection.query("INSERT INTO transfer SET ?", setData, (error, result) => {
                if (!error) {
                    const newResult = {
                        id: result.insertId,
                        ...setData,
                    };
                    delete newResult.user_password;
                    resolve(newResult);
                } else {
                    reject(new Error(error));
                }
            })
        })
	},
	getTransferByUser: (id, limit, offset) => {
		return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM transfer WHERE user_id_a = ${id} ORDER BY transfer_created_at DESC LIMIT ${limit} OFFSET ${offset}`, (error, result) => {
                !error ? resolve(result) : reject(new Error(error))
            })
        })
	},
    getWeekBalance: (user_id, user_role) => {
        return new Promise((resolve, reject) => {
            connection.query("SELECT SUM(transfer_amount) AS total FROM transfer WHERE transfer_created_at >= DATE(NOW()) - INTERVAL 7 DAY AND user_id_a = ? AND user_role = ?", [user_id, user_role], (error, result) => {
                !error ? resolve(result) : reject(new Error(error))
            })
        })
    },
    getDailyBalance: (user_id, user_role) => {
        return new Promise((resolve, reject) => {
            connection.query("SELECT DATE(transfer_created_at) as date, SUM(transfer_amount) AS total FROM transfer WHERE transfer_created_at >= DATE(NOW()) - INTERVAL 7 DAY AND user_id_a = ? AND user_role = ? GROUP BY DATE(transfer_created_at)", [user_id, user_role], (error, result) => {
                !error ? resolve(result) : reject(new Error(error))
            })
        })
    },
    getTransferCount: (id) => {
        return new Promise((resolve, reject) => {
            connection.query('SELECT COUNT(*) AS total FROM transfer WHERE user_id_a = ?', id, (error, result) => {
                !error ? resolve(result[0].total) : reject(new Error(error))
            })
        })
    },
}