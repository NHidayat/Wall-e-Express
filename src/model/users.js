const connection = require("../config/mysql");

module.exports = {
    getAllUser: (sort, limit, offset) => {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM user WHERE user_status = 1 ORDER BY ${sort} LIMIT ? OFFSET ?`, [limit, offset], (error, result) => {
                !error ? resolve(result) : reject(new Error(error));
            });
        });
    },
    getUserByName: (search, limit, offset) => {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM user WHERE user_first_name LIKE '%${search}%' OR user_last_name LIKE '%${search}%' LIMIT ? OFFSET ?`, [limit, offset], (error, result) => {
                !error ? resolve(result) : reject(new Error(error));
            });
        });
    },
    getUserCount: () => {
        return new Promise((resolve, reject) => {
            connection.query(
                "SELECT COUNT(*) as total FROM user ",
                (error, result) => {
                    !error ? resolve(result[0].total) : reject(new Error(error));
                }
            );
        });
    },
    getUserCountByName: (search) => {
        return new Promise((resolve, reject) => {
            connection.query(
                `SELECT COUNT(*) as total FROM user WHERE user_first_name LIKE '%${search}%' OR user_last_name LIKE '%${search}%'`,
                (error, result) => {
                    !error ? resolve(result[0].total) : reject(new Error(error));
                }
            );
        });
    },
    getUserById: (id) => {
        return new Promise((resolve, reject) => {
            connection.query(
                "SELECT * FROM user WHERE user_id = ?",
                id,
                (error, result) => {
                    if (!error) {
                        result.map(value => {
                            delete value.user_key
                            delete value.user_password
                        })
                        resolve(result)
                    } else {
                        reject(new Error(error))
                    }
                }
            );
        });
    },
    getUserByIdV2: (id) => {
        return new Promise((resolve, reject) => {
            connection.query(
                "SELECT * FROM user WHERE user_id = ?",
                id,
                (error, result) => {
                    !error ? resolve(result) : reject(new Error(error))
                }
            );
        });
    },
    checkPin: (id) => {
        return new Promise((resolve, reject) => {
            connection.query(
                "SELECT user_pin FROM user WHERE user_id = ?",
                id,
                (error, result) => {
                    if (!error) {
                        resolve(result)
                    } else {
                        reject(new Error(error))
                    }
                }
            );
        });
    },
    getPasswordById: (id) => {
        return new Promise((resolve, reject) => {
            connection.query(
                "SELECT user_password FROM user WHERE user_id = ?",
                id,
                (error, result) => {
                    if (!error) {
                        resolve(result)
                    } else {
                        reject(new Error(error))
                    }
                }
            );
        });
    },
    patchUser: (setData, id) => {
        return new Promise((resolve, reject) => {
            connection.query(
                "UPDATE user SET ? WHERE user_id = ?", [setData, id], (error, result) => {
                    if (!error) {
                        const newResult = {
                            user_id: id,
                            ...setData,
                        }
                        resolve(newResult);
                    } else {
                        reject(new Error(error));
                    }
                }
            )
        })
    },
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
    isPhoneExist: (phone) => {
        return new Promise((resolve, reject) => {
            connection.query(
                "SELECT user_phone FROM user WHERE (user_phone=?)",
                phone,
                (error, result) => {
                    !error ? resolve(result) : reject(new Error(error));
                }
            );
        });
    },
    isPhone_OtherUserExist: (phone, user_id) => {
        return new Promise((resolve, reject) => {
            connection.query(
                "SELECT user_phone FROM user WHERE user_phone = ? AND user_id != ?",
                [phone, user_id],
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
    }
}