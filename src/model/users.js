const connection = require("../config/mysql");

module.exports = {
    getAllUser: () => {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM user WHERE user_status = 1`, (error, result) => {
                !error ? resolve(result) : reject(new Error(error));
            });
        });
    },
    //===================================Register========================================
    isUserExist: (email) => {
        return new Promise((resolve, reject) => {
            connection.query(
                "SELECT user_email FROM user WHERE (user_email=?)",
                email,
                (error, result) => {
                    !error ? resolve(result) : reject(new Error(error));
                }
            );
        });
    },
    postUser: (setData) => {
        return new Promise((resolve, reject) => {
            connection.query("INSERT INTO user SET ?", setData, (error, result) => {
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
            });
        });
    },
    //============================================================================================================
    //===================================Activation User & Forgot Password========================================
    checkUser: (email) => {
        return new Promise((resolve, reject) => {
            connection.query(
                "SELECT * FROM user WHERE user_email = ?",
                email,
                (error, result) => {
                    !error ? resolve(result) : reject(new Error(error))
                }
            )
        })
    },
    checkKey: (keys) => {
        return new Promise((resolve, reject) => {
            connection.query(
                "SELECT * FROM user WHERE user_key = ?",
                keys,
                (error, result) => {
                    !error ? resolve(result) : reject(new Error(error))
                }
            )
        })
    },
    updating: (setData, email) => {
        return new Promise((resolve, reject) => {
            connection.query(
                "UPDATE user SET ? WHERE user_email = ?",
                [setData, email],
                (error, result) => {
                    if (!error) {
                        const newResult = {
                            user_email: email,
                            ...setData,
                        }
                        resolve(newResult)
                    } else {
                        reject(new Error(error))
                    }
                }
            )
        })
    },
    //=============================================================================================
}