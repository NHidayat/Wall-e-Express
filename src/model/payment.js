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
          console.log(transaction);
          resolve(transaction.redirect_url);
          // transaction token
          // let transactionToken = transaction.token;
          // console.log('transactionToken:',transactionToken);
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
};
