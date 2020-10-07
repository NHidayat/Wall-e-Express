const midtransClient = require("midtrans-client");
const helper = require("../helper/index");
const {
  createPayment,
  postHistory,
  postTopUp,
  updateBalance,
  checkUser,
  getHistoryById,
} = require("../model/payment");
const { getUserByIdV2 } = require('../model/users')
const { postNotification } = require('../model/m_notification')

module.exports = {
  postPayment: async (request, response) => {
    try {
      const { user_id, history_nominal } = request.body;
      const setData = {
        user_id,
        history_nominal,
        history_created_at: new Date(),
        history_status: 2
      };
      const topUpHistory = await postHistory(setData);
      const topUp = await createPayment(
        topUpHistory.id,
        topUpHistory.history_nominal
      );
      return helper.response(response, 200, "Success Create Payment", topUp);
    } catch (error) {
      return helper.response(response, 400, "Bad Request");
    }
  },
  postMidtransNotif: async (request, response) => {
    console.log('MIdtrans Run')
    console.log(request.body)
    let snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: "SB-Mid-server-YaT4PLgm0f1BcIn1Psy4UmHy",
      clientKey: "SB-Mid-client-46hKURBaHDya1KTT",
    });
    snap.transaction.notification(request.body).then(async (statusResponse) => {
      let orderId = statusResponse.order_id;
      let transactionStatus = statusResponse.transaction_status;
      let order_id = statusResponse.order_id;
      let gross_amount = statusResponse.gross_amount
      let fraudStatus = statusResponse.fraud_status;

      console.log(
        `Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`
      );

      const checkHistory = await getHistoryById(order_id)
      const userId = checkHistory[0].user_id
      const getUser = await getUserByIdV2(userId)
      const userBalance = getUser[0].user_balance

      if (transactionStatus == "capture") {
        if (fraudStatus == "challenge") {
        } else if (fraudStatus == "accept") {
        }
      } else if (transactionStatus == "settlement") {
        const calBalance = parseInt(gross_amount) + parseInt(userBalance)
        const notifData = {
          user_id: userId,
          notif_subject: 'Your Topup is Sucess',
          transfer_amount: gross_amount
        }
        const sendNotif = await postNotification(notifData)
        const updateSaldo = await updateBalance(calBalance, userId)
      } else if (transactionStatus == "deny") {
        const notifData = {
          user_id: userId,
          notif_subject: 'Your Topup is Denny',
          transfer_amount: 0
        }
        const sendNotif = await postNotification(notifData)
      } else if (
        transactionStatus == "cancel" ||
        transactionStatus == "expire"
      ) {
        const notifData = {
          user_id: userId,
          notif_subject: 'Your Topup Canceled',
          transfer_amount: 0
        }
        const sendNotif = await postNotification(notifData)
      } else if (transactionStatus == "pending") {
        const notifData = {
          user_id: userId,
          notif_subject: 'Your Topup is Pending',
          transfer_amount: gross_amount
        }
        const sendNotif = await postNotification(notifData)
      }
    })
      .then(() => {
        return helper.response(response, 200, "OK")
      })
      .catch((error) => {
        return helper.response(response, 400, error)
      })
  },
  postManualPayment: async (request, response) => {
    try {
      const { user_id, history_nominal } = request.body;
      const setData = {
        user_id,
        history_nominal,
        history_created_at: new Date(),
        history_status: 2
      };
      if (user_id === "" || user_id === null) {
        return helper.response(response, 400, "User ID must be filled");
      } else if ((history_nominal === "") | (history_nominal === null)) {
        return helper.response(response, 400, "Nominal must be filled");
      }
      let manualTopUp = await postTopUp(setData);
      let checkId = await checkUser(user_id);
      if (checkId.length > 0) {
        let newBalance =
          parseInt(manualTopUp.history_nominal) +
          parseInt(checkId[0].user_balance);
        const balanceUpdated = await updateBalance(newBalance, user_id);

        const formatBalance = helper.formatN(newBalance)
        return helper.response(response, 200, `User Balance Updated. Now your account balance is Rp ${formatBalance}`);
      }
    } catch (error) {
      return helper.response(response, 400, "Bad Request");
    }
  },
};