const midtransClient = require('midtrans-client');

module.exports = {
    createPayment: (topup_id, nominal) => {
        return new Promise((resolve, reject) => {
            let snap = new midtransClient.Snap({
                isProduction: false,
                serverKey: 'YOUR_SERVER_KEY',
                clientKey: 'YOUR_CLIENT_KEY'
            });
            let parameter = {
                "transaction_details": {
                    "order_id": topup_id,
                    "gross_amount": nominal
                }, "credit_card": {
                    "secure": true
                }
            };
            snap.createTransaction(parameter)
                .then((transaction) => {
                    console.log(transaction)
                    resolve(transaction.redirect_url)
                }).catch((error) => {
                    reject(error)
                    console.log(error)
                })
        })
    }
}