const connection = require("../config/mysql");

module.exports = {
	postNotification: (data) => {
		return new Promise((resolve, reject) => {
            connection.query("INSERT INTO notification SET ?", data, (error, result) => {
                !error ? resolve(result) : reject(new Error(error))
            });
        });
	}
}