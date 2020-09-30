const connection = require("../config/mysql");

module.exports = {
    getAllUser: () => {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM user WHERE user_status = 1`, (error, result) => {
                !error ? resolve(result) : reject(new Error(error));
            });
        });
    },
}