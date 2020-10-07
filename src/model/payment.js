const midtransClient = require("midtrans-client");
const db = require("../config/mysql");

module.exports = {
  createPayment: (id, nominal) => {
    return new Promise((resolve, reject) => {
      let snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: "SB-Mid-server-YaT4PLgm0f1BcIn1Psy4UmHy",
        clientKey: "SB-Mid-client-46hKURBaHDya1KTT",
      });

      let parameter = {
        transaction_details: {
          order_id: id,
          gross_amount: nominal,
        },
        credit_card: {
          secure: true,
        },
      };

      snap
        .createTransaction(parameter)
        .then((transaction) => {
          resolve(transaction.redirect_url);
        })
        .catch((error) => {
          reject(new Error(error));
        });
    });
  },
  postHistory: (setData) => {
    return new Promise((resolve, reject) => {
      db.query("INSERT INTO history SET ?", setData, (error, result) => {
        if (!error) {
          const newResult = {
            id: result.insertId,
            ...setData,
          };
          resolve(newResult);
        } else {
          reject(new Error(error));
        }
      });
    });
  },
  postTopUp: (setData) => {
    return new Promise((resolve, reject) => {
      db.query("INSERT INTO history SET ?", setData, (error, result) => {
        if (!error) {
          const newResult = {
            id: result.insertId,
            ...setData,
          };
          resolve(newResult);
        } else {
          reject(new Error(error))
        }
      });
    });
  },
  checkUser: (id) => {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM user WHERE user_id = ?", id, (error, result) => {
        !error ? resolve(result) : reject(new Error(error));
      });
    });
  },
  updateBalance: (balance, id) => {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE user SET user_balance = ? WHERE user_id = ?",
        [balance, id],
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error));
        }
      );
    });
  },
  getHistoryById: (id) => {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM history WHERE history_id = ?", id, (error, result) => {
        !error ? resolve(result) : reject(new Error(error));
      });
    });
  },
};