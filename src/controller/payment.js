const { request } = require('express')
const helper = require('../helper/index')
const { createPayment } = require('../model/payment')
module.exports = {
    postPayment: async (request, response) => {
        try {
            //========================tidak pakai modtrans=============================
            // [1] menyimpan save data to database: user id, nominal, created_at, 
            // berhasil simpan ke table topup response: topupid, user id, nominal, created_at, 
            // [2] check saldo sebelumnya sebelum dijumlahkan
            // [3] update saldo supaya saldo di user bertambah
            //=====================pake midtrans============================
            // [1] menyimpan save data to database: user id, nominal, created_at, status, 
            // berhasil simpan ke table topup response: topupid, user id, nominal, created_at, status, 
            // [2] update saldo supaya saldo di user bertambah
            //===================================================
            // request.body nya itu user_id dan nominal
            const { topup_id, nominal } = request.body
            const topup = await createPayment(topup_id, nominal)
            return helper.response(response, 200, 'Success Create Payment', topup)
        } catch (error) {
            return helper.response(response, 400, 'Bad Request', error)
        }
    },
    postMidtransNotif: async (request, response) => {
        let snap = new midtransClient.Snap({
            isProduction: false,
            serverKey: 'YOUR_SERVER_KEY',
            clientKey: 'YOUR_CLIENT_KEY'
        });

        snap.transaction.notification(notificationJson)
            .then((statusResponse) => {
                let orderId = statusResponse.order_id;
                let transactionStatus = statusResponse.transaction_status;
                let fraudStatus = statusResponse.fraud_status;

                console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);
                if (transactionStatus == 'capture') {
                    // capture only applies to card transaction, which you need to check for the fraudStatus
                    if (fraudStatus == 'challenge') {
                        // TODO set transaction status on your databaase to 'challenge'
                    } else if (fraudStatus == 'accept') {
                        // TODO set transaction status on your databaase to 'success'
                    }
                } else if (transactionStatus == 'settlement') {
                    // TODO set transaction status on your databaase to 'success'
                    // [1] proses update data status to table topup : status berhasil
                    // const updateStatusResult = await modelUpdateStatus(orderId, transactionStatus)
                    // response user_id, nominal
                    //==========================================================================
                    // [2] check nominal sebelumnya dan akan set parameter (user_id)
                    // response nominal sebelum topup
                    // nominal sebelumnya + nominal topup
                    //==========================================================================
                    // [3] update saldo supaya saldo di user bertambah {user_id, saldoBaru}
                } else if (transactionStatus == 'deny') {
                    // TODO you can ignore 'deny', because most of the time it allows payment retries
                    // and later can become success
                } else if (transactionStatus == 'cancel' ||
                    transactionStatus == 'expire') {
                    // TODO set transaction status on your databaase to 'failure'
                } else if (transactionStatus == 'pending') {
                    // TODO set transaction status on your databaase to 'pending' / waiting payment
                }
            });
    }
}