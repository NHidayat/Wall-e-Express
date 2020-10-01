const helper = require("../helper/index");
const { createPayment, postHistory } = require("../model/payment");

module.exports = {
  postPayment: async (request, response) => {
    try {
      const { user_id, history_nominal } = request.body;
      const setData = {
        user_id,
        history_nominal,
        history_created_at: new Date(),
      };
      const topUpHistory = await postHistory(setData);
      console.log(topUpHistory);
      const topUp = await createPayment(
        topUpHistory.id,
        topUpHistory.history_nominal
      );
      return helper.response(response, 200, "Success Create Payment", topUp);
    } catch (error) {
      return helper.response(response, 400, "Bad Request");
      // [model 1] proses save data to database : userid, nominal, created_at
      // berhasil simpan ke table topup response : topupId, userid, nominal, created_at
      // [model 2] update data saldo supaya saldo si user bertambah
      // ========================================
      // [model 1] proses save data to database : userid, nominal, status, created_at
      // berhasil simpan ke table topup response : topupId, userid, nominal, status, created_at
      // const { id_topup, nominal } = request.body;
      // const topUp = await createPayment(id_topup, nominal);
      // return helper.response(response, 400, "Bad Request");
    }
  },
  postMidtransNotif: async (request, response) => {
    let snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: "SB-Mid-server-YaT4PLgm0f1BcIn1Psy4UmHy",
      clientKey: "SB-Mid-client-46hKURBaHDya1KTT",
    });
    snap.transaction.notification(notificationJson).then((statusResponse) => {
      let orderId = statusResponse.order_id;
      let transactionStatus = statusResponse.transaction_status;
      let fraudStatus = statusResponse.fraud_status;

      console.log(
        `Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`
      );

      // Sample transactionStatus handling logic

      if (transactionStatus == "capture") {
        // capture only applies to card transaction, which you need to check for the fraudStatus
        if (fraudStatus == "challenge") {
          // TODO set transaction status on your databaase to 'challenge'
        } else if (fraudStatus == "accept") {
          // TODO set transaction status on your databaase to 'success'
        }
      } else if (transactionStatus == "settlement") {
        // TODO set transaction status on your databaase to 'success'
        // [model 1] update data status saldo user
        // const updateStatusResult = await modelupdateStatusResult(orderId, transactionStatus)
        //response user_id, nominal
        // ==================================
        // [model 2] check nominal sebelumnya dan akan set parameternya (user_id)
        // response nominal sebelum topup
        // ==================================
        // saldoBaru = nominal sebelum topup + nominal topup
        // [model 3] update data saldo supaya saldo si user bertambah (userId, saldoBaru)
      } else if (transactionStatus == "deny") {
        // TODO you can ignore 'deny', because most of the time it allows payment retries
        // and later can become success
      } else if (
        transactionStatus == "cancel" ||
        transactionStatus == "expire"
      ) {
        // TODO set transaction status on your databaase to 'failure'
      } else if (transactionStatus == "pending") {
        // TODO set transaction status on your databaase to 'pending' / waiting payment
      }
    });
  },
};
