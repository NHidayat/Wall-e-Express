const router = require("express").Router();

const { postPayment, postManualPayment, postMidtransNotif } = require("../controller/payment");
const { authorization } = require("../middleware/auth");

router.post("/", authorization, postPayment);
router.post("/top-up", authorization, postManualPayment);
router.post("/midtrans-notification", authorization, postMidtransNotif);

module.exports = router;
