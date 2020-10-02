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
	getTransferByUser: (id) => {
		return new Promise((resolve, reject) => {
            connection.query("SELECT * FROM transfer WHERE user_id_a = ?", id, (error, result) => {
                !error ? resolve(result) : reject(new Error(error))
            })
        })
	}
}