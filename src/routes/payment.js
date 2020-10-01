const router = require("express").Router();
const { postPayment, postMidtransNotif } = require('../controller/payment')

router.post('/', postPayment)
router.post('/midtrans-notification', postMidtransNotif)

module.exports = router;